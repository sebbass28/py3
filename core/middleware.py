from django.http import HttpResponsePermanentRedirect
from django.conf import settings

class CanonicalDomainMiddleware:
    """
    Middleware que asegura que todas las peticiones utilicen el dominio canónico.
    Si el host de la petición no coincide con CANONICAL_DOMAIN, se redirige.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # El dominio canónico deseado (sin protocolo)
        canonical_host = getattr(settings, 'CANONICAL_DOMAIN', 'codenext.es')
        
        # Obtenemos el host actual (quitando el puerto si existe)
        host = request.get_host().split(':')[0]
        
        # Solo redirigimos si NO estamos en DEBUG y el host no coincide
        if not settings.DEBUG and host != canonical_host:
            # Construimos la URL completa con HTTPS y dominio canónico
            new_url = f"https://{canonical_host}{request.get_full_path()}"
            return HttpResponsePermanentRedirect(new_url)

        return self.get_response(request)
