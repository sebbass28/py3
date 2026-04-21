from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from urllib.parse import quote
from urllib.request import urlopen, Request
import json
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .models import User, PublicClinic
from .serializers import UserSerializer, MyTokenObtainPairSerializer, UnifiedClinicDirectorySerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# --- VISTA PARA REGISTRE DE USUARIOS (SIGN UP) ---
class RegisterView(generics.CreateAPIView):
    # 1. Definimos el catálogo de usuarios (todos los registrados)
    queryset = User.objects.all()
    # 2. Permitimos el acceso público para que cualquiera pueda crear su cuenta
    permission_classes = (AllowAny,)
    # 3. Usamos el serializador que valida los datos del formulario (Email, Password, Rol)
    serializer_class = UserSerializer

# --- VISTA PARA INICIO DE SESIÓN (LOGIN CON JWT) ---
class MyTokenObtainPairView(TokenObtainPairView):
    # 1. Usamos nuestra versión personalizada que inyecta el 'role' y 'company_name' en el Token
    serializer_class = MyTokenObtainPairSerializer


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'error': 'El email es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_base_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:3000').rstrip('/')
            reset_link = f"{frontend_base_url}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject='Recuperación de contraseña - DentalLinkLab',
                message=(
                    "Hemos recibido una solicitud para restablecer tu contraseña.\n\n"
                    f"Abre este enlace para continuar:\n{reset_link}\n\n"
                    "Si no solicitaste este cambio, ignora este mensaje."
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@dentalinklab.local'),
                recipient_list=[user.email],
                fail_silently=True,
            )

        # Respuesta genérica para no filtrar si el email existe o no.
        return Response(
            {'detail': 'Si el correo existe, enviamos instrucciones para restablecer la contraseña.'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        if not uid or not token or not new_password:
            return Response(
                {'error': 'uid, token y new_password son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({'error': 'Enlace de recuperación inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'El enlace de recuperación expiró o no es válido.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'La nueva contraseña debe tener al menos 8 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)

# --- VISTA PARA GESTIÓN DEL PERFIL PROPIO (ME) ---
class ProfileView(generics.RetrieveUpdateAPIView):
    # 1. Usamos el serializador de usuario para mostrar los datos actuales
    serializer_class = UserSerializer
    # 2. Seguridad: Obligatorio estar logueado para ver o editar tu perfil
    permission_classes = (IsAuthenticated,)

    # ACCIÓN: ¿Qué objeto estamos editando?
    def get_object(self):
        # 1. Retornamos siempre el usuario que está haciendo la petición ahora mismo
        # Esto evita que un usuario intente editar el perfil de otro cambiando la ID
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()
        # Geocodificación best-effort para clínicas: no rompe el flujo si el proveedor falla.
        should_geocode = (
            user.role == User.IS_CLINIC and
            bool(user.address) and
            (
                not user.latitude or
                not user.longitude or
                self.request.query_params.get('geocode') == '1'
            )
        )
        if not should_geocode:
            return
        try:
            endpoint = f"https://nominatim.openstreetmap.org/search?q={quote(user.address)}&format=json&limit=1"
            request = Request(endpoint, headers={'User-Agent': 'DentalLinkLab/1.0'})
            with urlopen(request, timeout=4) as response:
                payload = json.loads(response.read().decode('utf-8'))
            if payload:
                user.latitude = float(payload[0].get('lat'))
                user.longitude = float(payload[0].get('lon'))
                user.save(update_fields=['latitude', 'longitude'])
        except Exception:
            # Silencioso para no bloquear la edición de perfil por fallo de red/proveedor.
            pass


# --- DIRECTORIO PÚBLICO DE CLÍNICAS (BUSCADOR PARA PACIENTES) ---
class ClinicDirectoryView(generics.ListAPIView):
    serializer_class = UnifiedClinicDirectorySerializer
    permission_classes = (AllowAny,)

    def list(self, request, *args, **kwargs):
        # Fuente 1: clínicas registradas en la plataforma.
        registered = User.objects.filter(role=User.IS_CLINIC).exclude(company_name__isnull=True)
        items = []
        registered_user_ids = set()
        for clinic in registered:
            if not clinic.company_name:
                continue
            registered_user_ids.add(clinic.id)
            items.append({
                'id': f"user-{clinic.id}",
                'company_name': clinic.company_name,
                'address': clinic.address,
                'phone': clinic.phone,
                'consultation_price': clinic.consultation_price,
                'rating': clinic.rating,
                'latitude': clinic.latitude,
                'longitude': clinic.longitude,
                'source_type': 'registered',
                'is_verified': True,
                'is_claimed': True,
            })

        # Fuente 2: catálogo abierto (clínicas no registradas o aún no reclamadas).
        public_clinics = PublicClinic.objects.filter(is_active=True)
        for clinic in public_clinics:
            if clinic.linked_user_id and clinic.linked_user_id in registered_user_ids:
                # Evitamos duplicar fichas ya representadas por usuario registrado.
                continue
            items.append({
                'id': f"public-{clinic.id}",
                'company_name': clinic.company_name,
                'address': clinic.address,
                'phone': clinic.phone,
                'consultation_price': clinic.consultation_price,
                'rating': clinic.rating,
                'latitude': clinic.latitude,
                'longitude': clinic.longitude,
                'source_type': 'public',
                'is_verified': bool(clinic.linked_user_id),
                'is_claimed': bool(clinic.linked_user_id),
            })

        # Filtros públicos por texto/precio/rating.
        search = self.request.query_params.get('search')
        max_price = self.request.query_params.get('max_price')
        min_rating = self.request.query_params.get('min_rating')
        sort = self.request.query_params.get('sort')

        if search:
            search_tokens = [token.strip() for token in search.split() if token.strip()]
            def match_item(item):
                searchable = f"{item.get('company_name') or ''} {item.get('address') or ''}".lower()
                return all(token.lower() in searchable for token in search_tokens)
            items = [item for item in items if match_item(item)]

        if max_price:
            try:
                max_price_num = float(max_price)
                items = [
                    item for item in items
                    if item.get('consultation_price') is not None and float(item['consultation_price']) <= max_price_num
                ]
            except ValueError:
                pass

        if min_rating:
            try:
                min_rating_num = float(min_rating)
                items = [
                    item for item in items
                    if item.get('rating') is not None and float(item['rating']) >= min_rating_num
                ]
            except ValueError:
                pass

        def price_sort_value(item):
            return float(item['consultation_price']) if item.get('consultation_price') is not None else 10**9

        def rating_sort_value(item):
            return float(item['rating']) if item.get('rating') is not None else -1

        if sort == 'price_asc':
            items = sorted(items, key=lambda item: (price_sort_value(item), -rating_sort_value(item), item.get('company_name') or ''))
        elif sort == 'price_desc':
            items = sorted(items, key=lambda item: (-price_sort_value(item), -rating_sort_value(item), item.get('company_name') or ''))
        elif sort == 'rating_desc':
            items = sorted(items, key=lambda item: (-rating_sort_value(item), price_sort_value(item), item.get('company_name') or ''))
        else:
            items = sorted(items, key=lambda item: (item.get('company_name') or '').lower())

        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
