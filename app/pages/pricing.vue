<template>
  <div class="pricing-page" id="pricing-page">
    <div class="container">
      <div class="pricing-header text-center animate-fade-in-up">
        <h1 class="page-title">
          Simple, Transparent <span class="text-gradient">Pricing</span>
        </h1>
        <p class="page-subtitle">
          Start free, upgrade when you need more. No hidden fees.
        </p>
      </div>

      <div class="pricing-grid stagger-children">
        <!-- Free Plan -->
        <div class="pricing-card card">
          <div class="pricing-plan-header">
            <span class="badge badge-accent">Free</span>
            <div class="pricing-price">
              <span class="price-amount">Rp 0</span>
              <span class="price-period">forever</span>
            </div>
            <p class="pricing-desc">Perfect for getting started with productivity tracking</p>
          </div>

          <ul class="pricing-features">
            <li class="feature-included">
              <span class="feature-check">✅</span>
              3 reports per month
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              AI insights (Bahasa Indonesia)
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Bar chart visualization
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              PDF download
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              30-day PDF storage
            </li>
            <li class="feature-excluded">
              <span class="feature-x">❌</span>
              <span>Excel export</span>
            </li>
            <li class="feature-excluded">
              <span class="feature-x">❌</span>
              <span>Public share link</span>
            </li>
            <li class="feature-excluded">
              <span class="feature-x">❌</span>
              <span>No watermark</span>
            </li>
          </ul>

          <NuxtLink to="/auth/register" class="btn btn-secondary btn-lg" style="width: 100%">
            Get Started Free
          </NuxtLink>
        </div>

        <!-- Pro Plan -->
        <div class="pricing-card pricing-card-pro card card-glow">
          <div class="pricing-popular-badge">
            <span class="badge badge-pro">⭐ Most Popular</span>
          </div>

          <div class="pricing-plan-header">
            <span class="badge badge-pro">Pro</span>
            <div class="pricing-price">
              <span class="price-amount">Rp 29.000</span>
              <span class="price-period">/ month</span>
            </div>
            <p class="pricing-desc">For power users who need unlimited productivity insights</p>
          </div>

          <ul class="pricing-features">
            <li class="feature-included">
              <span class="feature-check">✅</span>
              <strong>Unlimited</strong> reports
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              AI insights (Indonesia + English)
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Bar + pie + trend charts
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              PDF + Excel export
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              1-year PDF storage
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Public share link
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              No watermark
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Priority email support
            </li>
          </ul>

          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg" style="width: 100%">
            Start Pro Trial →
          </NuxtLink>
        </div>

        <!-- Self-Host -->
        <div class="pricing-card card">
          <div class="pricing-plan-header">
            <span class="badge" style="background: rgba(34, 197, 94, 0.1); color: #22c55e;">Self-Host</span>
            <div class="pricing-price">
              <span class="price-amount">Free</span>
              <span class="price-period">forever (AGPLv3)</span>
            </div>
            <p class="pricing-desc">Run FocusReport on your own server, fully customizable</p>
          </div>

          <ul class="pricing-features">
            <li class="feature-included">
              <span class="feature-check">✅</span>
              <strong>Unlimited</strong> everything
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Full source code access
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Use your own Groq API key
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Custom modifications
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              No watermark
            </li>
            <li class="feature-included">
              <span class="feature-check">✅</span>
              Docker support
            </li>
            <li class="feature-excluded">
              <span class="feature-x">⚠️</span>
              <span>Requires technical setup</span>
            </li>
            <li class="feature-excluded">
              <span class="feature-x">⚠️</span>
              <span>Community support only</span>
            </li>
          </ul>

          <a href="https://github.com/adibmaros/focusreport" target="_blank" class="btn btn-secondary btn-lg" style="width: 100%">
            ⭐ View on GitHub
          </a>
        </div>
      </div>

      <!-- FAQ -->
      <div class="faq-section animate-fade-in-up" style="animation-delay: 0.4s">
        <h2 class="text-center" style="margin-bottom: var(--space-xl)">
          Frequently Asked <span class="text-gradient">Questions</span>
        </h2>

        <div class="faq-grid">
          <div class="faq-item card" v-for="(faq, i) in faqs" :key="i">
            <h4>{{ faq.q }}</h4>
            <p class="text-secondary" style="font-size: 0.88rem; margin-top: var(--space-sm)">
              {{ faq.a }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Pricing — FocusReport',
})

const faqs = [
  {
    q: 'What is Pomofocus?',
    a: 'Pomofocus is a popular web-based Pomodoro timer (pomofocus.io) that allows you to export your focus session data as CSV files.',
  },
  {
    q: 'Can I try Pro for free?',
    a: 'Yes! We offer a 7-day free trial for Pro plan. No credit card required.',
  },
  {
    q: 'What AI model do you use?',
    a: 'We use Groq AI with LLaMA 3.3 70B model to generate natural, motivational insights in Bahasa Indonesia.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. Your CSV data is processed securely and never shared with third parties. You can delete your data at any time.',
  },
  {
    q: 'Can I self-host FocusReport?',
    a: 'Yes! FocusReport is fully open source under AGPLv3. You can clone the repo, use your own Groq API key, and deploy it anywhere.',
  },
  {
    q: 'How do I cancel my Pro subscription?',
    a: 'You can cancel anytime from your Settings page. Your Pro features will remain active until the end of the billing period.',
  },
]
</script>

<style scoped>
.pricing-page {
  padding: var(--space-3xl) 0;
}

.pricing-header {
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 900;
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  font-size: 1.05rem;
  color: var(--text-secondary);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  margin-bottom: var(--space-3xl);
}

.pricing-card {
  padding: var(--space-2xl);
  position: relative;
}

.pricing-card-pro {
  border-color: rgba(245, 158, 11, 0.15);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.03), var(--bg-card));
}

.pricing-popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.pricing-plan-header {
  margin-bottom: var(--space-xl);
}

.pricing-price {
  margin-top: var(--space-md);
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 900;
}

.price-period {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-left: 4px;
}

.pricing-desc {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: var(--space-sm);
}

.pricing-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.88rem;
}

.feature-included {
  color: var(--text-primary);
}

.feature-excluded {
  color: var(--text-tertiary);
}

/* FAQ */
.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.faq-item h4 {
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
