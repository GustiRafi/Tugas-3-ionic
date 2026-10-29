<template>
  <ion-page>
    <!-- Header Aplikasi Mobile -->
    <ion-header :translucent="true" class="ion-no-border custom-header">
      <ion-toolbar class="header-toolbar">
        <ion-title class="app-brand-title">
          <div class="brand-wrapper">
            <span class="crypto-icon">⚡</span>
            <div>
              <div class="brand-name">Crypto Ticker</div>
              <div class="brand-sub">MSIM4401 • Ionic Vue Capacitor</div>
            </div>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            class="header-refresh-btn"
            fill="solid"
            color="primary"
            :disabled="isLoading"
            @click="ambilData"
          >
            <ion-spinner v-if="isLoading" name="crescent" class="refresh-spinner"></ion-spinner>
            <span v-else>Refresh</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="main-content">
      <!-- Native Mobile Pull To Refresh (Capacitor Friendly) -->
      <ion-refresher slot="fixed" @ionRefresh="handlePullRefresh($event)">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          pulling-text="Tarik untuk memperbarui..."
          refreshing-spinner="crescent"
          refreshing-text="Memuat harga crypto terbaru..."
        >
        </ion-refresher-content>
      </ion-refresher>

      <div class="mobile-wrapper">
        <!-- Quick Stats & Last Updated Badge -->
        <div class="stats-banner">
          <div class="stat-pill">
            <span class="live-dot"></span>
            <span>Live Coinlore API</span>
          </div>
          <div v-if="lastUpdated" class="stat-pill update-time">
            🕒 {{ lastUpdated }}
          </div>
        </div>

        <!-- Search Bar Real-Time Filter -->
        <div class="search-section">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Cari coin (misal: BTC, Ethereum)..."
            :debounce="150"
            class="custom-searchbar"
          ></ion-searchbar>
        </div>

        <!-- Segment Switcher: Tampilan Soal Tugas vs Tampilan Modern Fintech -->
        <div class="view-switch-container">
          <ion-segment v-model="viewMode" value="task" mode="ios" class="segment-custom">
            <ion-segment-button value="task">
              <ion-label>Sesuai Soal Tugas</ion-label>
            </ion-segment-button>
            <ion-segment-button value="modern">
              <ion-label>Fintech Modern</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <!-- Loading Skeleton / Spinner State -->
        <div v-if="isLoading && (!cryptoData || cryptoData.length === 0)" class="loading-container">
          <ion-spinner name="crescent" color="primary" class="big-spinner"></ion-spinner>
          <p class="loading-text">Sedang mengambil data crypto terkini...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="error-container">
          <div class="error-emoji">⚠️</div>
          <p class="error-msg">{{ errorMessage }}</p>
          <ion-button shape="round" color="danger" @click="ambilData">
            Coba Lagi
          </ion-button>
        </div>

        <!-- Empty Search Result -->
        <div v-else-if="filteredCoins.length === 0" class="empty-container">
          <div class="empty-emoji">🔍</div>
          <p class="empty-msg">Tidak ada cryptocurrency yang cocok dengan "<strong>{{ searchQuery }}</strong>"</p>
          <ion-button size="small" fill="outline" @click="searchQuery = ''">Reset Pencarian</ion-button>
        </div>

        <!-- TAMPILAN 1: SESUAI SOAL TUGAS (Dengan sentuhan estetika tinggi) -->
        <div v-else-if="viewMode === 'task'" class="task-view-container">
          <table class="task-crypto-table">
            <tbody>
              <tr
                v-for="coin in filteredCoins"
                :key="'task-' + coin.id"
                class="task-crypto-row"
              >
                <!-- Kolom 1: Rank -->
                <td class="col-rank">
                  <div class="cell-label">Rank</div>
                  <div class="rank-value-wrapper">
                    <span class="rank-val">{{ coin.rank }}</span>
                  </div>
                </td>

                <!-- Kolom 2: Nama & Simbol -->
                <td class="col-name-symbol">
                  <div class="cell-label ellipsis-text">{{ coin.name }}</div>
                  <div class="symbol-val">{{ coin.symbol }}</div>
                </td>

                <!-- Kolom 3: Harga USD -->
                <td class="col-price">
                  <div class="cell-label">USD</div>
                  <div class="price-val">{{ coin.price_usd }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAMPILAN 2: FINTECH MODERN CARDS (Mobile-First Card View) -->
        <div v-else class="modern-cards-container">
          <div
            v-for="coin in filteredCoins"
            :key="'modern-' + coin.id"
            class="crypto-modern-card"
          >
            <div class="card-left">
              <div class="coin-avatar" :style="{ backgroundColor: getCoinColor(coin.symbol) }">
                {{ coin.symbol.slice(0, 3) }}
              </div>
              <div class="coin-meta">
                <div class="coin-symbol-row">
                  <span class="modern-symbol">{{ coin.symbol }}</span>
                  <span class="modern-rank-badge">#{{ coin.rank }}</span>
                </div>
                <div class="modern-name">{{ coin.name }}</div>
              </div>
            </div>

            <div class="card-right">
              <div class="modern-price">${{ formatPrice(coin.price_usd) }}</div>
              <div
                class="modern-change"
                :class="isNegative(coin.percent_change_24h) ? 'down' : 'up'"
              >
                <span class="arrow-indicator">{{ isNegative(coin.percent_change_24h) ? '▼' : '▲' }}</span>
                <span>{{ Math.abs(Number(coin.percent_change_24h) || 0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Attribution -->
        <div class="footer-info">
          <span>Menampilkan {{ filteredCoins.length }} dari {{ cryptoData ? cryptoData.length : 0 }} Cryptocurrency</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonButton,
  IonSpinner,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import EndPointAccess from '@/services/EndPointAccess';

interface CryptoTicker {
  id: string;
  symbol: string;
  name: string;
  nameid: string;
  rank: number;
  price_usd: string;
  percent_change_24h: string;
  percent_change_1h: string;
  percent_change_7d: string;
  price_btc: string;
  market_cap_usd: string;
  volume24: number;
}

let resData: any;

export default defineComponent({
  name: 'Home',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonButton,
    IonSpinner,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
  },
  data() {
    return {
      cryptoData: null as CryptoTicker[] | null,
      isLoading: false,
      errorMessage: '',
      searchQuery: '',
      viewMode: 'task',
      lastUpdated: '',
    };
  },
  computed: {
    filteredCoins(): CryptoTicker[] {
      if (!this.cryptoData) return [];
      if (!this.searchQuery.trim()) return this.cryptoData;
      const q = this.searchQuery.toLowerCase().trim();
      return this.cryptoData.filter(
        (coin) =>
          coin.name.toLowerCase().includes(q) ||
          coin.symbol.toLowerCase().includes(q) ||
          String(coin.rank) === q
      );
    },
  },
  mounted() {
    this.ambilData();
  },
  methods: {
    async ambilData() {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Getar haptic via Capacitor (jika berjalan di perangkat native)
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // Abaikan jika di browser desktop
      }

      try {
        resData = new EndPointAccess('https://api.coinlore.net/api/tickers/');
        const response: any = await resData.getRes();
        if (response.data && Array.isArray(response.data.data)) {
          this.cryptoData = response.data.data;
        } else if (Array.isArray(response.data)) {
          this.cryptoData = response.data;
        }
        const now = new Date();
        this.lastUpdated = now.toLocaleTimeString('id-ID');
      } catch (error) {
        console.error('Gagal mengambil data:', error);
        this.errorMessage = 'Gagal mengambil data API. Pastikan internet aktif.';
      } finally {
        this.isLoading = false;
      }
    },
    async handlePullRefresh(event: any) {
      await this.ambilData();
      event.target.complete();
    },
    formatPrice(price: string | number): string {
      const num = Number(price);
      if (isNaN(num)) return String(price);
      if (num >= 1) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    },
    isNegative(percentStr: string | number): boolean {
      return Number(percentStr) < 0;
    },
    getCoinColor(symbol: string): string {
      const colors: Record<string, string> = {
        BTC: '#f7931a',
        ETH: '#627eea',
        USDT: '#26a17b',
        BNB: '#f3ba2f',
        SOL: '#14f195',
        USDC: '#2775ca',
        XRP: '#23292f',
        ADA: '#0033ad',
        AVAX: '#e84142',
        DOGE: '#c2a633',
      };
      return colors[symbol.toUpperCase()] || '#3b82f6';
    },
  },
});
</script>

<style scoped>
/* App Header */
.custom-header {
  background: var(--ion-background-color, #ffffff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.header-toolbar {
  --padding-start: 12px;
  --padding-end: 12px;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.crypto-icon {
  font-size: 22px;
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ion-text-color, #111827);
  letter-spacing: -0.3px;
}

.brand-sub {
  font-size: 0.68rem;
  color: var(--ion-color-medium, #6b7280);
  font-weight: 500;
}

.header-refresh-btn {
  --border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  height: 34px;
}

.refresh-spinner {
  width: 16px;
  height: 16px;
  --color: #ffffff;
}

/* Mobile Wrapper Container */
.main-content {
  --background: #f8fafc;
}

.mobile-wrapper {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 14px 40px 14px;
}

/* Stats Banner */
.stats-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.update-time {
  color: #64748b;
  font-weight: 500;
}

.live-dot {
  width: 7px;
  height: 7px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Search Section */
.search-section {
  margin-bottom: 10px;
}

.custom-searchbar {
  --background: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  --placeholder-color: #94a3b8;
  padding: 0;
  font-size: 0.88rem;
}

/* Segment Switcher */
.view-switch-container {
  margin-bottom: 16px;
}

.segment-custom {
  background: #e2e8f0;
  border-radius: 10px;
  padding: 3px;
}

/* TAMPILAN 1: SESUAI SOAL TUGAS (Tabel Kuning/Krem Elegan) */
.task-view-container {
  background-color: #fbf2c8;
  border: 1px solid #d8c896;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.task-crypto-table {
  width: 100%;
  border-collapse: collapse;
}

.task-crypto-row {
  border-bottom: 1px solid #d8c896;
  transition: background-color 0.15s ease;
}

.task-crypto-row:last-child {
  border-bottom: none;
}

.task-crypto-row:active {
  background-color: #f3e6b4;
}

.col-rank {
  width: 22%;
  padding: 11px 8px 11px 14px;
  vertical-align: middle;
}

.col-name-symbol {
  width: 42%;
  padding: 11px 8px;
  vertical-align: middle;
}

.col-price {
  width: 36%;
  padding: 11px 14px 11px 8px;
  vertical-align: middle;
}

.cell-label {
  font-size: 11px;
  line-height: 14px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 2px;
}

.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.rank-val {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.symbol-val {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.2px;
}

.price-val {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

/* TAMPILAN 2: FINTECH MODERN CARDS */
.modern-cards-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.crypto-modern-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 14px 16px;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.crypto-modern-card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: -0.5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.coin-meta {
  display: flex;
  flex-direction: column;
}

.coin-symbol-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.modern-symbol {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.modern-rank-badge {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.modern-name {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 1px;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.modern-price {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.modern-change {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 2px;
}

.modern-change.up {
  color: #10b981;
}

.modern-change.down {
  color: #ef4444;
}

.arrow-indicator {
  font-size: 0.6rem;
}

/* Status States */
.loading-container,
.error-container,
.empty-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.big-spinner {
  width: 32px;
  height: 32px;
}

.loading-text {
  font-size: 0.88rem;
  color: #64748b;
  margin-top: 12px;
}

.error-emoji,
.empty-emoji {
  font-size: 36px;
  margin-bottom: 8px;
}

.error-msg,
.empty-msg {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 14px;
}

/* Footer Info */
.footer-info {
  text-align: center;
  margin-top: 20px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}
</style>
