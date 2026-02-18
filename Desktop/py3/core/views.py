from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.contrib import messages
from .models import Skill, Profile, MatchRequest
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    top_skills = Skill.objects.annotate(
        mentor_count=Count('mentors'),
        learner_count=Count('learners')
    ).order_by('-mentor_count')[:10]
    
    return render(request, 'core/landing.html', {'top_skills': top_skills})

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'core/signup.html', {'form': form})

@login_required
def dashboard(request):
    profile = request.user.profile
    # Simple matching algorithm
    # People who want what I offer
    learners = Profile.objects.filter(skills_wanted__in=profile.skills_offered.all()).distinct().exclude(user=request.user)
    
    # People who offer what I want
    mentors = Profile.objects.filter(skills_offered__in=profile.skills_wanted.all()).distinct().exclude(user=request.user)
    
    # Calculate matches with scores
    suggested_mentors = []
    for p in mentors:
        match_data = profile.get_matching_score(p)
        if match_data['score'] > 0:
            suggested_mentors.append({
                'profile': p,
                'score': match_data['score'],
                'skills': match_data['teach'] # Skills they teach me
            })
    
    suggested_mentors.sort(key=lambda x: x['score'], reverse=True)
    
    # Incoming requests
    received_requests = request.user.received_requests.filter(status='PENDING')
    
    context = {
        'suggested_mentors': suggested_mentors[:5],
        'learners_count': learners.count(),
        'mentors_count': mentors.count(),
        'received_requests': received_requests,
        'my_skills_count': profile.skills_offered.count(),
    }
    return render(request, 'core/dashboard.html', context)

@login_required
def profile_edit(request):
    profile = request.user.profile
    
    if request.method == 'POST':
        # Update basic info
        profile.bio = request.POST.get('bio', '')
        profile.department = request.POST.get('department', '')
        profile.position = request.POST.get('position', '')
        profile.save()
        
        # Update skills (simplified for MVP: comma separated or multiple select)
        # Using a select multiple in frontend, we get lists of IDs
        offered_ids = request.POST.getlist('skills_offered')
        wanted_ids = request.POST.getlist('skills_wanted')
        
        profile.skills_offered.set(offered_ids)
        profile.skills_wanted.set(wanted_ids)
        
        messages.success(request, 'Perfil actualizado correctamente.')
        return redirect('profile')
        
    all_skills = Skill.objects.all()
    return render(request, 'core/profile_form.html', {
        'profile': profile,
        'all_skills': all_skills
    })

@login_required
def network(request):
    query = request.GET.get('q')
    profiles = Profile.objects.exclude(user=request.user)
    
    if query:
        profiles = profiles.filter(
            Q(user__username__icontains=query) |
            Q(department__icontains=query) |
            Q(skills_offered__name__icontains=query)
        ).distinct()
        
    return render(request, 'core/network.html', {'profiles': profiles})

@login_required
def send_request(request, user_id):
    receiver = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        MatchRequest.objects.create(
            sender=request.user,
            receiver=receiver,
            message=request.POST.get('message', 'Hola, me gustaría conectar para aprender.')
        )
        messages.success(request, f'Solicitud enviada a {receiver.username}')
    return redirect('network')
