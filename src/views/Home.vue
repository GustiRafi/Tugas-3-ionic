<template>
  <ion-page>
    <!-- Header Aplikasi Fintech Mobile -->
    <ion-header :translucent="true" class="ion-no-border header-fintech">
      <ion-toolbar class="toolbar-fintech">
        <ion-title class="brand-title">
          <div class="brand-box">
            <div class="brand-icon">⚡</div>
            <div>
              <div class="brand-name">Crypto Markets</div>
              <div class="brand-sub">Real-Time Cryptocurrency Ticker</div>
            </div>
          </div>
        </ion-title>

        <ion-buttons slot="end">
          <ion-button
            class="refresh-btn-fintech"
            fill="solid"
            color="primary"
            :disabled="isLoading"
            @click="ambilData"
          >
            <ion-spinner v-if="isLoading" name="crescent" class="btn-spinner"></ion-spinner>
            <span v-else>Refresh</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="content-fintech">
      <!-- Native Mobile Pull To Refresh (Capacitor) -->
      <ion-refresher slot="fixed" @ionRefresh="handlePullRefresh($event)">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          pulling-text="Tarik untuk refresh harga..."
          refreshing-spinner="crescent"
          refreshing-text="Mengambil harga terbaru..."
        >
        </ion-refresher-content>
      </ion-refresher>

      <div class="fintech-mobile-container">
        <!-- Live Market Status Bar -->
        <div class="market-status-bar">
          <div class="status-chip live-chip">
            <span class="live-dot"></span>
            <span>API Online</span>
          </div>
          <div v-if="lastUpdated" class="status-chip time-chip">
            🕒 Diperbarui: {{ lastUpdated }}
          </div>
        </div>

        <!-- Search Bar Real-Time Filter -->
        <div class="search-box">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Cari koin (misal: BTC, Solana)..."
            :debounce="150"
            class="fintech-searchbar"
          ></ion-searchbar>
        </div>

        <!-- Summary Header List -->
        <div class="list-header-row">
          <span class="list-title">Aset Cryptocurrency</span>
          <span class="list-count">{{ filteredCoins.length }} Koin</span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && (!cryptoData || cryptoData.length === 0)" class="state-card loading-card">
          <ion-spinner name="crescent" color="primary" class="state-spinner"></ion-spinner>
          <p>Memuat pasar crypto terkini...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="state-card error-card">
          <div class="state-icon">⚠️</div>
          <p>{{ errorMessage }}</p>
          <ion-button shape="round" color="danger" size="small" @click="ambilData">
            Coba Lagi
          </ion-button>
        </div>

        <!-- Empty Search Result -->
        <div v-else-if="filteredCoins.length === 0" class="state-card empty-card">
          <div class="state-icon">🔍</div>
          <p>Tidak menemukan koin "<strong>{{ searchQuery }}</strong>"</p>
          <ion-button size="small" fill="outline" shape="round" @click="searchQuery = ''">
            Reset Pencarian
          </ion-button>
        </div>

        <!-- TAMPILAN FINTECH MODERN (Single Clean View) -->
        <div v-else class="coin-list">
          <div
            v-for="coin in filteredCoins"
            :key="coin.id"
            class="coin-card"
          >
            <!-- Bagian Kiri: Avatar Simbol & Nama Koin -->
            <div class="coin-left">
              <div
                class="coin-avatar"
                :style="{ background: getCoinGradient(coin.symbol) }"
              >
                {{ coin.symbol.slice(0, 3) }}
              </div>
              <div class="coin-details">
                <div class="symbol-rank-row">
                  <span class="coin-symbol">{{ coin.symbol }}</span>
                  <span class="coin-rank-pill">Rank #{{ coin.rank }}</span>
                </div>
                <div class="coin-name">{{ coin.name }}</div>
              </div>
            </div>

            <!-- Bagian Kanan: Harga USD & Persentase 24 Jam -->
            <div class="coin-right">
              <div class="coin-price">
                <span class="currency-prefix">$</span>{{ formatPrice(coin.price_usd) }}
              </div>
              <div
                class="coin-badge-change"
                :class="isNegative(coin.percent_change_24h) ? 'badge-down' : 'badge-up'"
              >
                <span class="arrow-symbol">{{ isNegative(coin.percent_change_24h) ? '▼' : '▲' }}</span>
                <span>{{ Math.abs(Number(coin.percent_change_24h) || 0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Attribution -->
        <div class="fintech-footer">
          <p>Data bersumber dari <strong>Coinlore API</strong></p>
          <p class="sub-footer">MSIM4401 Modul Praktikum Ionic Vue • Powered by Capacitor</p>
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
    IonRefresher,
    IonRefresherContent,
  },
  data() {
    return {
      cryptoData: null as CryptoTicker[] | null,
      isLoading: false,
      errorMessage: '',
      searchQuery: '',
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

      // Haptic tactile feedback via Capacitor
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // Fallback untuk browser
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
        this.errorMessage = 'Gagal memuat data dari Coinlore API. Silakan periksa koneksi internet.';
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
    getCoinGradient(symbol: string): string {
      const gradients: Record<string, string> = {
        BTC: 'linear-gradient(135deg, #f7931a, #e67e22)',
        ETH: 'linear-gradient(135deg, #627eea, #3b5998)',
        USDT: 'linear-gradient(135deg, #26a17b, #1b8061)',
        BNB: 'linear-gradient(135deg, #f3ba2f, #d4981d)',
        SOL: 'linear-gradient(135deg, #9945ff, #14f195)',
        USDC: 'linear-gradient(135deg, #2775ca, #1a5697)',
        XRP: 'linear-gradient(135deg, #23292f, #434a54)',
        ADA: 'linear-gradient(135deg, #0033ad, #002273)',
        AVAX: 'linear-gradient(135deg, #e84142, #b82b2c)',
        DOGE: 'linear-gradient(135deg, #c2a633, #a68c22)',
      };
      return gradients[symbol.toUpperCase()] || 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    },
  },
});
</script>

<style scoped>
/* Header Fintech */
.header-fintech {
  background: #ffffff;
  border-bottom: 1px solid #eef2f6;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.toolbar-fintech {
  --padding-start: 14px;
  --padding-end: 14px;
  --min-height: 58px;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  line-height: 1.2;
}

.brand-sub {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 500;
}

.refresh-btn-fintech {
  --background: #2563eb;
  --background-hover: #1d4ed8;
  --background-activated: #1e40af;
  --border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  height: 34px;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  --color: #ffffff;
}

/* Konten Utama */
.content-fintech {
  --background: #f8fafc;
}

.fintech-mobile-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 14px 14px 40px 14px;
}

/* Status Bar */
.market-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 2px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.time-chip {
  color: #64748b;
  font-weight: 500;
}

.live-dot {
  width: 7px;
  height: 7px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Search Bar */
.search-box {
  margin-bottom: 14px;
}

.fintech-searchbar {
  --background: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  --placeholder-color: #94a3b8;
  padding: 0;
  font-size: 0.88rem;
}

/* Header Daftar */
.list-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px 10px 4px;
}

.list-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.list-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Daftar Kartu Crypto */
.coin-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coin-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 13px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.coin-card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

/* Kiri: Avatar, Simbol & Rank */
.coin-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coin-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: -0.5px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.coin-details {
  display: flex;
  flex-direction: column;
}

.symbol-rank-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.coin-symbol {
  font-size: 1.02rem;
  font-weight: 700;
  color: #0f172a;
}

.coin-rank-pill {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.66rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.coin-name {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 1px;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Kanan: Harga USD & Badge 24h */
.coin-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.coin-price {
  font-size: 1.02rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.currency-prefix {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-right: 1px;
}

.coin-badge-change {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  font-weight: 700;
  margin-top: 3px;
  padding: 2px 7px;
  border-radius: 6px;
}

.badge-up {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.badge-down {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.arrow-symbol {
  font-size: 0.58rem;
}

/* Status State Cards */
.state-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  color: #475569;
}

.state-spinner {
  width: 32px;
  height: 32px;
}

.state-icon {
  font-size: 34px;
  margin-bottom: 8px;
}

/* Footer */
.fintech-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.5;
}

.sub-footer {
  font-size: 0.68rem;
  color: #cbd5e1;
}
</style>
