# Prompt Implementasi Typography untuk AI Coder

Gunakan panduan berikut untuk mengimplementasikan sistem typography pada aplikasi dashboard **Worktion** agar tampil modern, clean, elegant, dan mudah dibaca.

## Objective
Terapkan typography system yang cocok untuk aplikasi SaaS dashboard dengan karakter:
- modern
- professional
- clean
- highly readable
- strong readability untuk angka, metric, card, sidebar, dan data dashboard

## Font Recommendation
Gunakan font utama berikut:
- **Primary Font:** Inter
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

Implementasi CSS font family:

```css
font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

## Typography Rules
1. Gunakan hanya **1 font family utama** di seluruh aplikasi.
2. Batasi font weight agar UI tetap rapi dan konsisten.
3. Prioritaskan readability untuk dashboard cards, menu, table, schedule, dan big numbers.
4. Jangan gunakan font dekoratif.
5. Pastikan angka menggunakan tabular numbers agar alignment rapi.

## Font Weights
Gunakan weight berikut:
- 400 = body text
- 500 = menu item, label, card title
- 600 = section title
- 700 = page title, metric value, important numbers

## Typography Scale
Implementasikan ukuran font berikut:
- **Page Title:** 30px / 700 / line-height 36px
- **Section Title:** 20px / 600
- **Card Metric Value:** 28px / 700
- **Card Title:** 14px / 500
- **Body Text:** 14px / 400
- **Subtitle / Supporting Text:** 16px / 400
- **Helper / Meta Text:** 12px / 400
- **Sidebar Section Label:** 12px / 600 / uppercase / letter-spacing 0.08em
- **Sidebar Menu Item:** 14px / 500

## Component-Level Guidance
### 1. Page Header
- Judul utama seperti: "Good Afternoon, Jaiden!"
- Size 30px, weight 700, line-height 36px

### 2. Subtitle Header
- Teks deskripsi di bawah title
- Size 16px, weight 400
- Gunakan warna abu sekunder seperti #6B7280

### 3. Sidebar
- Section labels: 12px, 600, uppercase, tracking 0.08em
- Menu item: 14px, 500

### 4. Dashboard Cards
- Card title: 14px, 500, secondary text color
- Main metric / numbers: 28px, 700
- Meta text seperti "Live data": 12px, 400

### 5. Schedule / Reminder / List Items
- Item title: 14px, 500
- Meta info / time: 12px, 400

## Line Height Rules
Gunakan line-height berikut:
- Page title: 1.2
- Section title: 1.3
- Body text: 1.5
- Small text: 1.4

## Numeric Rendering
Aktifkan tabular numbers untuk seluruh komponen dashboard yang menampilkan angka.

```css
font-feature-settings: "tnum";
```

Terapkan terutama pada:
- KPI cards
- tables
- charts labels
- schedule time
- statistics

## CSS Variables Recommendation
Buat global typography tokens berikut:

```css
:root {
  --font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-md: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-2xl: 30px;
}
```

## Example Base Styles

```css
body {
  font-family: var(--font-family);
  font-size: var(--text-sm);
  line-height: 1.5;
  font-feature-settings: "tnum";
}

h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.2;
}

h2 {
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.3;
}
```

## Expected Result
Hasil akhir harus membuat UI terasa:
- clean
- modern
- elegant
- enterprise-ready
- nyaman dibaca pada desktop dashboard
- konsisten di sidebar, cards, analytics, dan schedule panel

## Final Instruction for AI Coder
Implementasikan typography system aplikasi menggunakan **Inter** sebagai font utama, dengan hierarchy ukuran dan weight yang konsisten untuk dashboard SaaS. Fokus pada readability, visual hierarchy, dan alignment angka pada komponen data-heavy UI. Terapkan font tokens global, component typography rules, serta tabular numbers untuk seluruh angka dan metric.
