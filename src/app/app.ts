import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  menuOpen = signal(false);
  darkMode = signal(true);

  // Contact / WhatsApp
  readonly whatsappNumber = '237696114146';
  readonly cvUrl = 'CV_Abel.pdf';
  contactForm = { name: '', email: '', subject: '', message: '' };
  formSent = signal(false);

  // Experience filters
  readonly experienceFilters = ['Tous', 'Fullstack', 'Backend', 'Mobile', 'QA'];
  activeExperienceFilter = signal('Tous');

  private ctx!: CanvasRenderingContext2D;
  private particles: Array<{x: number; y: number; vx: number; vy: number; size: number}> = [];
  private mouse = { x: 0, y: 0 };
  private animationId = 0;
  private gradientX = 50;
  private gradientY = 50;

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.gradientX = (e.clientX / window.innerWidth) * 100;
    this.gradientY = (e.clientY / window.innerHeight) * 100;
    document.body.style.setProperty('--gradient-x', `${this.gradientX}%`);
    document.body.style.setProperty('--gradient-y', `${this.gradientY}%`);
  }

  @HostListener('window:resize')
  onResize() {
    if (this.canvasRef?.nativeElement) {
      this.canvasRef.nativeElement.width = window.innerWidth;
      this.canvasRef.nativeElement.height = window.innerHeight;
    }
  }

  ngAfterViewInit() {
    this.initParticles();
    this.initScrollAnimations();
    this.initMagneticButtons();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
  }

  private initParticles() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext('2d')!;

    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }
    this.animate();
  }

  private animate() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.particles.forEach((p, i) => {
      // Mouse attraction
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250) {
        const force = (250 - dist) / 250;
        p.vx += dx * 0.001 * force;
        p.vy += dy * 0.001 * force;
      }

      p.vx *= 0.95;
      p.vy *= 0.95;

      p.x += p.vx;
      p.y += p.vy;

      // Bounds
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
      this.ctx.fill();

      // Connect to mouse (web effect)
      const distToMouse = Math.sqrt((p.x - this.mouse.x) ** 2 + (p.y - this.mouse.y) ** 2);
      if (distToMouse < 200) {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = `rgba(14, 165, 233, ${0.3 - distToMouse / 600})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }

      // Connect nearby particles
      this.particles.slice(i + 1).forEach(p2 => {
        const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (d < 150) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(14, 165, 233, ${0.25 - d / 600})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.skill-card, .project-card, .education-card, .github-card').forEach(el => {
      el.classList.add('scroll-animate');
      observer.observe(el);
    });
  }

  qualities = [
    'Travail d\'equipe',
    'Organise et dynamique',
    'Sens relationnel',
    'Capacite d\'adaptation'
  ];

  skillCategories = [
    {
      icon: '{ }',
      title: 'Langages',
      skills: ['Dart', 'PHP', 'Python', 'C#', 'JavaScript', 'TypeScript', 'Java', 'C++', 'HTML/CSS']
    },
    {
      icon: '< >',
      title: 'Frameworks',
      skills: ['Flutter', 'React Native', 'Node.js', 'NestJS', 'Next.js', 'Angular', 'Vue.js', 'Laravel', 'Symfony', 'CodeIgniter', 'Django', 'FastAPI', 'Spring Boot', '.NET', 'TensorFlow']
    },
    {
      icon: 'DB',
      title: 'Bases de donnees',
      skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Elasticsearch']
    },
    {
      icon: 'QA',
      title: 'Tests & QA',
      skills: ['Cypress', 'Playwright', 'Cucumber', 'Tests fonctionnels', 'Tests d\'integration']
    },
    {
      icon: 'CI',
      title: 'DevOps & Outils',
      skills: ['Docker', 'CI/CD', 'Jenkins', 'Terraform', 'Prometheus', 'Grafana', 'SonarQube', 'Trivy', 'Git', 'GitLab', 'GitHub', 'Bitbucket', 'Jira', 'Confluence', 'Postman', 'Figma', 'Power BI', 'Spark']
    },
    {
      icon: 'API',
      title: 'APIs & Architecture',
      skills: ['REST API', 'SOAP', 'MVC', 'MVP', 'BLoC', 'Microservices', 'UML', 'MERISE 2', 'Methode Agile']
    }
  ];

  experiences = [
    {
      title: 'Developpeur Full-Stack Senior - HES',
      company: 'HES',
      period: 'Mars 2026 - Juil. 2026',
      location: 'Rouyn-Noranda, Canada',
      mode: 'Remote',
      categories: ['Fullstack', 'Backend', 'Mobile', 'QA'],
      tasks: [
        'Conception d\'applications web et mobiles en architecture hexagonale (frontend, backend)',
        'Definition des choix techniques et mise en place d\'architectures scalables',
        'Developpement d\'API REST et integration de solutions cloud',
        'Encadrement technique, revue de code et accompagnement sur les bonnes pratiques',
        'Strategies de tests automatises (unitaires, integration, E2E) et amelioration CI/CD'
      ],
      tech: ['Architecture hexagonale', 'API REST', 'Cloud', 'CI/CD', 'Tests E2E']
    },
    {
      title: 'Responsable tests - KLAVIS Legal CRM',
      company: 'MANSA',
      period: 'Dec. 2025 - Fev. 2026',
      location: 'Yaounde, Cameroun',
      mode: 'Remote',
      categories: ['QA', 'Backend'],
      tasks: [
        'Tests E2E automatises Playwright (TypeScript) pour les workflows juridiques',
        'Tests d\'integration backend et API avec .NET 8 + xUnit',
        'Verification de la coherence et de l\'integrite des donnees (PostgreSQL)',
        'Detection et prevention des regressions sur les workflows critiques',
        'Integration des suites de tests dans les pipelines CI/CD frontend et backend'
      ],
      tech: ['Playwright', 'TypeScript', '.NET 8', 'xUnit', 'Docker', 'PostgreSQL']
    },
    {
      title: 'Developpeur Backend et Mobile PerfectPay',
      company: 'UDEV-TECHZ',
      period: 'Oct. 2025 - Dec. 2025',
      location: 'Douala, Cameroun',
      mode: 'Remote',
      categories: ['Backend', 'Mobile', 'Fullstack'],
      tasks: [
        'Solution Fintech complete : app mobile Flutter + microservices backend',
        'Integration des paiements Stripe (Cash In / Cash Out), multi-devises et statuts',
        'Parcours KYC complet avec suivi du statut en temps reel',
        'Webhooks Stripe, communication event-driven (Kafka) et idempotence',
        'Securisation via JWT, RBAC, stockage securise et bonnes pratiques PCI-DSS'
      ],
      tech: ['Flutter', 'FastAPI', 'Stripe', 'Kafka', 'Docker', 'PostgreSQL']
    },
    {
      title: 'Developpeur d\'Application Mobile',
      company: 'I-TECH',
      period: 'Avr. 2025 - Sept. 2025',
      location: 'Douala, Cameroun',
      mode: 'Presentiel',
      categories: ['Mobile'],
      tasks: [
        'Analyse du projet avec UML et 2TUP',
        'Conception UI/UX sur Figma et developpement Flutter connecte au Core Banking System (.NET)',
        'My Collect : consultation soldes, transactions, statistiques, prets et remboursements',
        'Amelioration des processus et refonte des interfaces de I-Collect'
      ],
      tech: ['Flutter', 'Figma', 'Core Banking System', '.NET']
    },
    {
      title: 'Developpeur et testeur Mobile - BeOne',
      company: 'BeLab',
      period: 'Nov. 2024 - Mai 2025',
      location: 'Paris, France',
      mode: 'Remote',
      categories: ['Mobile', 'Backend', 'QA'],
      tasks: [
        'Developpement backend NestJS pour les APIs de l\'application mobile',
        'Analyse et resolution de la lenteur d\'affichage du graphe',
        'Optimisation de la recuperation des donnees du brassard en React Native (1h a 10min)'
      ],
      tech: ['NestJS', 'React Native', 'Node.js']
    },
    {
      title: 'Migration et developpement Web / Mobile',
      company: 'MEDx eHealthCenter',
      period: 'Juin 2022 - Jan. 2025',
      location: 'Veldhoven, Pays-Bas',
      mode: 'Remote',
      categories: ['Fullstack', 'Backend', 'Mobile', 'QA'],
      tasks: [
        'Migration du systeme MEDx de CodeIgniter 3 vers CodeIgniter 4',
        'Application web PHP (MVC) + Angular, APIs REST securisees et scalables',
        'Application mobile Kotlin suivant le modele MVP, designs UI/UX sur Figma',
        'Integration Elasticsearch pour l\'indexation des medecins et dossiers medicaux',
        'Tests fonctionnels, securite, integration et non-regression avec Cypress'
      ],
      tech: ['PHP', 'Angular', 'Kotlin', 'Elasticsearch', 'Cypress', 'Power BI']
    },
    {
      title: 'Developpeur et testeur logiciel Web / Mobile',
      company: 'AITE-Consulting',
      period: 'Aout 2024 - Nov. 2024',
      location: 'Douala, Cameroun',
      mode: 'Presentiel',
      categories: ['Mobile', 'Backend', 'QA'],
      tasks: [
        'Analyse du projet avec UML et 2TUP',
        'Migration de l\'application KwataHelp d\'Expo 43 vers Expo 51',
        'App mobile de maintenance immobiliere du Port Autonome de Douala (Flutter)',
        'APIs REST securisees et scalables avec NextJS, plan de tests'
      ],
      tech: ['Flutter', 'Expo', 'NextJS', 'REST API']
    },
    {
      title: 'Developpeur et testeur E-VOUCHER',
      company: 'FKs/KAVAA',
      period: 'Mars 2024 - Juillet 2024',
      location: 'Yaounde, Cameroun',
      mode: 'Remote',
      categories: ['Fullstack', 'Backend', 'Mobile', 'QA'],
      tasks: [
        'Application web suivant le modele MVC avec Laravel',
        'Application mobile Flutter',
        'Tests automatiques Playwright, tests fonctionnels, securite, integration, acceptation',
        'Conferences de formations'
      ],
      tech: ['Laravel', 'Flutter', 'Playwright']
    },
    {
      title: 'Developpeur Full-Stack',
      company: 'TNH TECHNOLOGIES',
      period: 'Mai 2022 - Mars 2024',
      location: 'Yaounde, Cameroun',
      mode: 'Remote',
      categories: ['Fullstack', 'Backend', 'Mobile'],
      tasks: [
        'Developpement backend NextJS pour la gestion des APIs et la logique metier',
        'Application mobile de gestion de budget avec Flutter',
        'Analyse de donnees utilisateurs pour optimiser le parcours client (Python, Spark)',
        'Presentation des donnees avec graphes dynamiques et indicateurs de performance',
        'Creation d\'un site web avec le CMS WordPress'
      ],
      tech: ['NextJS', 'Flutter', 'Python', 'Spark', 'WordPress']
    },
    {
      title: 'Developpeur Web',
      company: 'NEW BASE TECHNOLOGIES',
      period: 'Juillet 2021 - Mai 2022',
      location: 'Yaounde, Cameroun',
      mode: 'Presentiel',
      categories: ['Fullstack', 'QA'],
      tasks: [
        'Formation en test logiciel',
        'Mise en place d\'une application web E-commerce',
        'Tests manuels et automatiques'
      ],
      tech: ['Web', 'E-commerce', 'Tests']
    }
  ];

  education = [
    {
      year: '2025',
      diploma: 'Master 1 Developpement Web et Mobile',
      school: 'ESTIAM',
      location: 'Paris, France'
    },
    {
      year: '2025',
      diploma: 'Certification Ingenieur Associe en IA',
      school: 'UDEMY',
      location: 'En ligne',
      url: 'https://www.udemy.com/certificate/UC-8a879d8f-3262-4e1e-93bb-0b9495ee3031/'
    },
    {
      year: '2025',
      diploma: 'Certificat Explorateur en Ingenierie IA',
      school: 'UDEMY',
      location: 'En ligne',
      url: 'https://www.udemy.com/certificate/UC-818fd30e-2ed5-4de6-92ae-070db53d02e3/'
    },
    {
      year: '2023-2024',
      diploma: 'Diplome d\'Ingenieur Genie Logiciel',
      school: 'IAI (Institut africain d\'informatique)',
      location: 'Yaounde, Cameroun'
    },
    {
      year: '2023-2024',
      diploma: 'Licence professionnelle',
      school: 'IAI (Institut africain d\'informatique)',
      location: 'Yaounde, Cameroun'
    },
    {
      year: '2020-2021',
      diploma: 'Baccalaureat en Technologies de l\'Information',
      school: 'Lycee bilingue de Nkongsamba',
      location: 'Nkongsamba, Cameroun'
    }
  ];

  projects = [
    {
      title: 'Nexma',
      description: 'Plateforme SaaS de gestion du travail pour les equipes : membres, postes et contrats, affectation des taches, suivi du temps, rapports quotidiens et journal d\'audit',
      url: 'https://nexma.org',
      tech: ['Next.js', 'React', 'NestJS', 'Prisma', 'PostgreSQL', 'MongoDB', 'React Native'],
      type: 'SaaS - Web & Mobile'
    },
    {
      title: 'E-Voucher Patnuc',
      description: 'Plateforme de gestion de bons electroniques avec application mobile',
      url: 'https://evoucher.patnuc.cm/',
      apk: 'https://evoucher.patnuc.cm/executables/3.2.8/evoucher.apk',
      tech: ['Laravel', 'Flutter', 'Playwright'],
      type: 'Web & Mobile'
    },
    {
      title: 'MedXe Health Center',
      description: 'Plateforme de sante en ligne pour centre medical',
      url: 'https://www.medxehealthcenter.com/',
      tech: ['PHP', 'Angular', 'Kotlin', 'Elasticsearch'],
      type: 'Web & Mobile'
    },
    {
      title: 'Perfect Pay Cameroon',
      description: 'Solution Fintech de paiement multi-devises',
      url: 'https://perfectpaycameroon.com/',
      tech: ['Flutter', 'FastAPI', 'Stripe', 'Docker'],
      type: 'Fintech'
    },
    {
      title: 'SecuredSys',
      description: 'Site web professionnel cree avec WordPress',
      url: 'https://securedsys.net/',
      tech: ['WordPress', 'PHP', 'CSS'],
      type: 'CMS'
    }
  ];

  githubProjects = [
    { name: 'objets-hub', tech: 'TypeScript', desc: 'API NestJS hexagonale + Next.js, sync temps reel Socket.IO' },
    { name: 'AWS-Modern-Engineering', tech: 'C#', desc: 'Serverless AWS : Lambda, S3, DynamoDB, Rekognition' },
    { name: 'sentiment-ai', tech: 'Python', desc: 'Pipeline CI/CD 11 etapes (Jenkins) : Terraform, Prometheus/Grafana, Trivy, SonarQube, Docker' },
    { name: 'mon-vpn', tech: 'Flutter', desc: 'Application VPN mobile Flutter' },
    { name: 'mobile-frontend-test-template', tech: 'Dart', desc: 'Template architecture mobile', stars: 7 },
    { name: 'backend-test-template', tech: 'Dockerfile', desc: 'Template architecture backend', stars: 2 },
    { name: 'Playwright-Javascript-QA', tech: 'JavaScript', desc: 'Tests automatises QA' },
    { name: 'CI4-Elasticsearch-MySql', tech: 'PHP', desc: 'CodeIgniter 4 + Elasticsearch' },
    { name: 'angular-frontend-products-demo', tech: 'TypeScript', desc: 'Demo Angular products' },
    { name: 'django-api-products-demo', tech: 'Python', desc: 'API REST Django' },
    { name: 'crud-flutter', tech: 'Flutter', desc: 'CRUD Flutter complet' },
    { name: 'backend-crud-nodejs', tech: 'JavaScript', desc: 'Backend Node.js CRUD' }
  ];

  private initMagneticButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
      const el = btn as HTMLElement;
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  get whatsappLink(): string {
    return `https://wa.me/${this.whatsappNumber}`;
  }

  /** Apercu (screenshot) du site distant, genere a la volee par Microlink. */
  previewUrl(url: string): string {
    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  }

  /** Repli si Microlink echoue : on tente thum.io, puis on masque l'apercu. */
  onPreviewError(event: Event) {
    const img = event.target as HTMLImageElement;
    const site = img.dataset['site'] ?? '';
    if (img.dataset['stage'] !== 'fallback' && site) {
      img.dataset['stage'] = 'fallback';
      img.src = `https://image.thum.io/get/width/640/crop/400/${site}`;
    } else {
      img.closest('.project-preview')?.classList.add('is-hidden');
    }
  }

  get filteredExperiences() {
    const f = this.activeExperienceFilter();
    if (f === 'Tous') return this.experiences;
    return this.experiences.filter(exp => exp.categories.includes(f));
  }

  experienceFilterCount(filter: string): number {
    if (filter === 'Tous') return this.experiences.length;
    return this.experiences.filter(exp => exp.categories.includes(filter)).length;
  }

  setExperienceFilter(filter: string) {
    this.activeExperienceFilter.set(filter);
  }

  private monthIndex(token: string): number {
    const map: Record<string, number> = {
      jan: 0, janvier: 0, fev: 1, fevrier: 1, mars: 2, avr: 3, avril: 3, mai: 4,
      juin: 5, juil: 6, juillet: 6, aout: 7, sept: 8, septembre: 8, oct: 9,
      octobre: 9, nov: 10, novembre: 10, dec: 11, decembre: 11
    };
    return map[token.toLowerCase().replace(/[^a-z]/g, '')] ?? 0;
  }

  private parsePeriod(period: string): { start: number; end: number } | null {
    const parts = period.split('-').map(s => s.trim());
    if (parts.length !== 2) return null;
    const toIndex = (s: string) => {
      const m = s.match(/([A-Za-z.]+)\s+(\d{4})/);
      return m ? this.monthIndex(m[1]) + parseInt(m[2], 10) * 12 : null;
    };
    const start = toIndex(parts[0]);
    const end = toIndex(parts[1]);
    return start === null || end === null ? null : { start, end };
  }

  /** Cumule reelle (union des intervalles) pour eviter de compter deux fois les missions en parallele. */
  private experienceSpanMonths(filter: string): number {
    const list = filter === 'Tous'
      ? this.experiences
      : this.experiences.filter(exp => exp.categories.includes(filter));
    const intervals = list
      .map(exp => this.parsePeriod(exp.period))
      .filter((iv): iv is { start: number; end: number } => iv !== null)
      .sort((a, b) => a.start - b.start);

    let months = 0;
    let curStart = -1;
    let curEnd = -1;
    for (const iv of intervals) {
      if (iv.start > curEnd) {
        if (curStart >= 0) months += curEnd - curStart + 1;
        curStart = iv.start;
        curEnd = iv.end;
      } else {
        curEnd = Math.max(curEnd, iv.end);
      }
    }
    if (curStart >= 0) months += curEnd - curStart + 1;
    return months;
  }

  experienceSpanLabel(filter: string): string {
    const months = this.experienceSpanMonths(filter);
    if (months < 12) return `${months} mois d'activite`;
    return `~${Math.round((months / 12) * 10) / 10} ans d'activite`;
  }

  sendWhatsApp(event: Event) {
    event.preventDefault();
    const f = this.contactForm;
    const lines = [
      'Bonjour Abel, je vous contacte depuis votre portfolio.',
      '',
      `Nom : ${f.name || '-'}`,
      `Email : ${f.email || '-'}`,
      `Sujet : ${f.subject || '-'}`,
      '',
      f.message || ''
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${this.whatsappNumber}?text=${text}`, '_blank');
    this.formSent.set(true);
    this.contactForm = { name: '', email: '', subject: '', message: '' };
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  toggleTheme() {
    this.darkMode.update(v => !v);
    document.body.classList.toggle('light-theme');
  }
}
