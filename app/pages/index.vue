<template>
  <div class="landing" id="landing-page">
    <!-- Hero Section -->
    <section class="hero" id="hero-section">
      <div class="hero-bg">
        <div class="hero-grid"></div>
        <div class="hero-glow"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-badge animate-fade-in-up">
          <span class="badge badge-accent">🚀 Open Source</span>
          <span class="hero-badge-text">AGPLv3 Licensed</span>
        </div>
        <h1 class="hero-title animate-fade-in-up" style="animation-delay: 0.1s">
          Turn Your Pomodoro Sessions<br />
          Into <span class="text-gradient">Powerful Insights</span>
        </h1>
        <p class="hero-desc animate-fade-in-up" style="animation-delay: 0.2s">
          Upload your Pomofocus CSV, get a beautiful PDF report with statistics,
          charts, and AI-powered insights — all in under 30 seconds.
        </p>
        <div class="hero-actions animate-fade-in-up" style="animation-delay: 0.3s">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg" id="hero-cta">
            Get Started Free →
          </NuxtLink>
          <NuxtLink to="/pricing" class="btn btn-secondary btn-lg" id="hero-pricing">
            View Pricing
          </NuxtLink>
        </div>

        <div class="hero-stats animate-fade-in-up" style="animation-delay: 0.4s">
          <div class="hero-stat">
            <span class="hero-stat-value">3</span>
            <span class="hero-stat-label">Simple Steps</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-value">&lt;30s</span>
            <span class="hero-stat-label">Time to PDF</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-value">AI</span>
            <span class="hero-stat-label">Powered Insights</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section" id="how-it-works">
      <div class="container">
        <h2 class="section-title text-center">
          How It <span class="text-gradient">Works</span>
        </h2>
        <p class="section-desc text-center">
          From raw CSV data to professional PDF report in 3 simple steps
        </p>

        <div class="steps-grid stagger-children">
          <div class="step-card card card-glow" v-for="(step, i) in steps" :key="i">
            <div class="step-number">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section" id="features">
      <div class="container">
        <h2 class="section-title text-center">
          Everything You <span class="text-gradient">Need</span>
        </h2>
        <p class="section-desc text-center">
          Powerful features to help you understand your productivity data
        </p>

        <div class="features-grid stagger-children">
          <div class="feature-card card" v-for="(feature, i) in features" :key="i">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h4 class="feature-title">{{ feature.title }}</h4>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="pricing-section" id="pricing">
      <div class="container">
        <h2 class="section-title text-center">
          Simple <span class="text-gradient">Pricing</span>
        </h2>
        <p class="section-desc text-center">
          Start free, upgrade when you need more
        </p>

        <div class="pricing-grid">
          <div class="pricing-card card">
            <div class="pricing-header">
              <span class="badge badge-accent">Free</span>
              <h3 class="pricing-price">Rp 0</h3>
              <p class="pricing-period">forever</p>
            </div>
            <ul class="pricing-features">
              <li>✅ 3 reports / month</li>
              <li>✅ AI insights (Bahasa Indonesia)</li>
              <li>✅ Bar chart visualization</li>
              <li>✅ PDF download</li>
              <li>✅ 30-day PDF storage</li>
              <li>❌ Excel export</li>
              <li>❌ Share link</li>
            </ul>
            <NuxtLink to="/auth/register" class="btn btn-secondary" style="width: 100%">
              Get Started
            </NuxtLink>
          </div>

          <div class="pricing-card pricing-card-pro card card-glow">
            <div class="pricing-popular">
              <span class="badge badge-pro">⭐ Most Popular</span>
            </div>
            <div class="pricing-header">
              <span class="badge badge-pro">Pro</span>
              <h3 class="pricing-price">Rp 29.000</h3>
              <p class="pricing-period">/ month</p>
            </div>
            <ul class="pricing-features">
              <li>✅ Unlimited reports</li>
              <li>✅ AI insights (ID + English)</li>
              <li>✅ Bar + pie + trend charts</li>
              <li>✅ PDF + Excel export</li>
              <li>✅ 1-year PDF storage</li>
              <li>✅ Share link</li>
              <li>✅ No watermark</li>
              <li>✅ Priority support</li>
            </ul>
            <NuxtLink to="/auth/register" class="btn btn-primary" style="width: 100%">
              Start Pro Trial →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section" id="cta">
      <div class="container">
        <div class="cta-card card">
          <h2 class="cta-title">
            Ready to turn your Pomodoro data into<br />
            <span class="text-gradient">actionable insights</span>?
          </h2>
          <p class="cta-desc">
            Join hundreds of productive people who use FocusReport to understand their work patterns.
          </p>
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg" id="cta-button">
            Get Started Free →
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'FocusReport — Turn Your Pomodoro Sessions Into Insights',
})

const steps = [
  {
    icon: '📤',
    title: 'Upload CSV',
    desc: 'Drag & drop your Pomofocus CSV export file. We support the standard Pomofocus format.',
  },
  {
    icon: '⚡',
    title: 'Auto Analyze',
    desc: 'Our system calculates statistics, generates charts, and writes AI-powered insights.',
  },
  {
    icon: '📄',
    title: 'Download PDF',
    desc: 'Get a beautiful, professional PDF report ready to download, share, or archive.',
  },
]

const features = [
  {
    icon: '📊',
    title: 'Smart Statistics',
    desc: 'Total time, active days, daily averages, peak days — all calculated automatically.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Insights',
    desc: 'Groq AI analyzes your data and writes motivational, actionable insights in Bahasa Indonesia.',
  },
  {
    icon: '📈',
    title: 'Visual Charts',
    desc: 'Beautiful bar charts, project distribution, and weekly trends in your PDF report.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'From upload to PDF in under 30 seconds. No waiting, no hassle.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your data is processed securely. We never share your productivity data with anyone.',
  },
  {
    icon: '🌐',
    title: 'Open Source',
    desc: 'Fully open source under AGPLv3. Self-host it, modify it, contribute to it.',
  },
]
</script>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: calc(var(--nav-height) + var(--space-3xl)) 0 var(--space-3xl);
  overflow: hidden;
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(124, 93, 250, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 93, 250, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 50% 60% at 50% 40%, black, transparent);
}

.hero-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 500px;
  background: radial-gradient(circle, rgba(124, 93, 250, 0.08) 0%, transparent 70%);
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.hero-badge-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: var(--space-lg);
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 auto var(--space-xl);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-3xl);
}

.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-lg) var(--space-2xl);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hero-stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-light);
}

.hero-stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border-color);
}

/* Sections */
.how-section,
.features-section,
.pricing-section,
.cta-section {
  padding: var(--space-3xl) 0;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.section-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: var(--space-2xl);
}

/* Steps */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

.step-card {
  text-align: center;
  position: relative;
}

.step-number {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.1em;
  margin-bottom: var(--space-md);
}

.step-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
}

.step-title {
  font-size: 1.15rem;
  margin-bottom: var(--space-sm);
}

.step-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.feature-card {
  padding: var(--space-xl);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: var(--space-md);
}

.feature-title {
  font-size: 1.05rem;
  margin-bottom: var(--space-sm);
}

.feature-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Pricing */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
  max-width: 800px;
  margin: 0 auto;
}

.pricing-card {
  padding: var(--space-2xl);
  position: relative;
}

.pricing-card-pro {
  border-color: rgba(245, 158, 11, 0.2);
}

.pricing-popular {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.pricing-header {
  margin-bottom: var(--space-xl);
}

.pricing-price {
  font-size: 2.5rem;
  font-weight: 900;
  margin-top: var(--space-md);
}

.pricing-period {
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.pricing-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.pricing-features li {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

/* CTA */
.cta-card {
  text-align: center;
  padding: var(--space-3xl);
  background: linear-gradient(135deg, var(--bg-card), rgba(124, 93, 250, 0.05));
  border-color: rgba(124, 93, 250, 0.1);
}

.cta-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: var(--space-md);
}

.cta-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-stats {
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
  }

  .hero-stat-divider {
    width: 40px;
    height: 1px;
  }

  .steps-grid,
  .features-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>
