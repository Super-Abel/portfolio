import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  menuOpen = signal(false);
  darkMode = signal(true);
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

    document.querySelectorAll('.skill-card, .project-card, .timeline-item, .education-card, .github-card').forEach(el => {
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
      skills: ['Dart', 'PHP', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'HTML/CSS']
    },
    {
      icon: '< >',
      title: 'Frameworks',
      skills: ['Flutter', 'React Native', 'Node.js', 'Next.js', 'Angular', 'Vue.js', 'Laravel', 'Django', 'FastAPI', 'Spring Boot']
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
      skills: ['Docker', 'CI/CD', 'Git', 'Jira', 'Postman', 'Figma', 'Power BI']
    },
    {
      icon: 'API',
      title: 'APIs & Architecture',
      skills: ['REST API', 'SOAP', 'MVC', 'MVP', 'BLoC', 'Microservices']
    }
  ];

  experiences = [
    {
      title: 'QA Automation Engineer - KLAVIS CRM',
      company: 'MANSA',
      period: 'Dec. 2025 - Present',
      location: 'Remote, Cameroun',
      tasks: [
        'Tests E2E automatises Playwright pour workflows juridiques',
        'Tests API backend .NET 8 + xUnit',
        'Integration CI/CD pipelines frontend et backend',
        'Detection regressions sur workflows critiques'
      ],
      tech: ['Playwright', 'TypeScript', '.NET 8', 'xUnit', 'Docker', 'PostgreSQL']
    },
    {
      title: 'Developpeur Backend et Mobile PerfectPay',
      company: 'UDEV-TECHZ',
      period: 'Nov. 2025 - Present',
      location: 'Remote, Cameroun',
      tasks: [
        'Microservices Stripe Payment & KYC (FastAPI, Kafka)',
        'App mobile Flutter avec BLoC, JWT, Stripe API',
        'Transactions multi-devises, webhooks, idempotence',
        'Securisation PCI-DSS, RBAC, stockage securise'
      ],
      tech: ['Flutter', 'FastAPI', 'Stripe', 'Kafka', 'Docker', 'PostgreSQL']
    },
    {
      title: 'Developpeur Application Mobile',
      company: 'I-TECH',
      period: 'Avr. 2025 - Sept. 2025',
      location: 'Douala, Cameroun',
      tasks: [
        'Analyse UML et 2TUP',
        'Application My Collect pour banques et microfinances',
        'Refonte interfaces I-Collect'
      ],
      tech: ['Flutter', 'Figma', 'Core Banking System']
    },
    {
      title: 'Developpeur et testeur Mobile - BeOne',
      company: 'BeLab',
      period: 'Nov. 2024 - Mai 2025',
      location: 'Remote, France',
      tasks: [
        'Developpement backend JavaScript',
        'Optimisation recuperation donnees (1h a 10min)',
        'Resolution problemes de performance'
      ],
      tech: ['JavaScript', 'Node.js', 'Mobile']
    },
    {
      title: 'Migration et developpement Web/Mobile',
      company: 'MEDx eHeathCenter',
      period: 'Juin 2022 - Jan. 2025',
      location: 'Remote, Pays-Bas',
      tasks: [
        'Migration CodeIgniter 3 vers 4',
        'Application web PHP/Angular et mobile Kotlin',
        'Integration Elasticsearch',
        'Tests Cypress (fonctionnels, securite, integration)'
      ],
      tech: ['PHP', 'Angular', 'Kotlin', 'Elasticsearch', 'Cypress', 'Power BI']
    },
    {
      title: 'Developpeur et testeur logiciel',
      company: 'AITE-Consulting',
      period: 'Aout 2024 - Nov. 2024',
      location: 'Douala, Cameroun',
      tasks: [
        'Migration Expo 43 vers Expo 51',
        'Application maintenance immobiliere Flutter',
        'Creation plan de tests'
      ],
      tech: ['Flutter', 'Expo', 'REST API']
    },
    {
      title: 'Developpeur et testeur E-VOUCHER',
      company: 'FKs/KAVAA',
      period: 'Mars 2024 - Juillet 2024',
      location: 'Yaounde, Cameroun',
      tasks: [
        'Application web Laravel 9',
        'Application mobile Flutter',
        'Tests automatiques Playwright',
        'Conferences de formations'
      ],
      tech: ['Laravel', 'Flutter', 'Playwright']
    }
  ];

  education = [
    {
      year: '2025',
      diploma: 'Master Developpement Web et Mobile',
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
      school: 'IAI',
      location: 'Yaounde, Cameroun'
    },
    {
      year: '2021-2023',
      diploma: 'Technicien Superieur',
      school: 'IAI',
      location: 'Yaounde, Cameroun'
    }
  ];

  projects = [
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

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  toggleTheme() {
    this.darkMode.update(v => !v);
    document.body.classList.toggle('light-theme');
  }
}
