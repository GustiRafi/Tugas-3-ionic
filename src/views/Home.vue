<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="app-screen">
        <!-- Tombol Refresh -->
        <div class="header-action">
          <ion-button
            class="refresh-btn"
            :disabled="isLoading"
            @click="ambilData"
          >
            <ion-spinner
              v-if="isLoading"
              name="crescent"
              class="btn-spinner"
            ></ion-spinner>
            <span v-else>Refresh</span>
          </ion-button>
        </div>

        <!-- Indikator Loading Pertama Kali -->
        <div v-if="isLoading && (!cryptoData || cryptoData.length === 0)" class="status-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Memuat data cryptocurrency...</p>
        </div>

        <!-- Daftar Cryptocurrency Sesuai Tampilan Soal Tugas -->
        <div v-if="cryptoData && cryptoData.length > 0" class="crypto-container">
          <table class="crypto-table">
            <tbody>
              <tr
                v-for="coin in cryptoData"
                :key="coin.id"
                class="crypto-row"
              >
                <!-- Kolom 1: Rank -->
                <td class="col-rank">
                  <div class="cell-label">Rank</div>
                  <div class="cell-value">{{ coin.rank }}</div>
                </td>

                <!-- Kolom 2: Nama & Simbol -->
                <td class="col-name-symbol">
                  <div class="cell-label ellipsis">{{ coin.name }}</div>
                  <div class="cell-value">{{ coin.symbol }}</div>
                </td>

                <!-- Kolom 3: Harga USD -->
                <td class="col-price">
                  <div class="cell-label">USD</div>
                  <div class="cell-value">{{ coin.price_usd }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pesan Error jika Gagal -->
        <div v-if="errorMessage" class="status-box error">
          <p>{{ errorMessage }}</p>
          <ion-button size="small" @click="ambilData">Coba Lagi</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
} from '@ionic/vue';
import { defineComponent } from 'vue';
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
    IonContent,
    IonButton,
    IonSpinner,
  },
  data() {
    return {
      cryptoData: null as CryptoTicker[] | null,
      isLoading: false,
      errorMessage: '',
    };
  },
  mounted() {
    // Ambil data otomatis saat halaman dimuat
    this.ambilData();
  },
  methods: {
    async ambilData() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        resData = new EndPointAccess('https://api.coinlore.net/api/tickers/');
        const response: any = await resData.getRes();
        // API coinlore membungkus array data di response.data.data
        if (response.data && Array.isArray(response.data.data)) {
          this.cryptoData = response.data.data;
        } else if (Array.isArray(response.data)) {
          this.cryptoData = response.data;
        }
      } catch (error) {
        console.error('Gagal mengambil data crypto:', error);
        this.errorMessage = 'Gagal memuat data dari API Coinlore. Silakan periksa koneksi internet.';
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<style scoped>
/* Mobile-first Layout */
.app-screen {
  max-width: 440px;
  margin: 0 auto;
  padding: 18px 12px 36px 12px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Tombol Refresh */
.header-action {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
}

.refresh-btn {
  --background: #1976d2;
  --background-hover: #1565c0;
  --background-activated: #0d47a1;
  --color: #ffffff;
  --border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  min-height: 36px;
  height: 36px;
  --padding-start: 22px;
  --padding-end: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  --color: #ffffff;
}

/* Container Tabel Cryptocurrency */
.crypto-container {
  width: 100%;
  background-color: #fbf2c8;
  border-top: 1px solid #d8c896;
  border-bottom: 1px solid #d8c896;
}

.crypto-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fbf2c8;
}

.crypto-row {
  border-bottom: 1px solid #d8c896;
}

.crypto-row:last-child {
  border-bottom: none;
}

/* Styling Kolom */
.col-rank {
  width: 22%;
  padding: 10px 8px 10px 14px;
  vertical-align: middle;
  text-align: left;
}

.col-name-symbol {
  width: 40%;
  padding: 10px 8px;
  vertical-align: middle;
  text-align: left;
}

.col-price {
  width: 38%;
  padding: 10px 14px 10px 8px;
  vertical-align: middle;
  text-align: left;
}

/* Label Kecil di Atas */
.cell-label {
  font-size: 11px;
  line-height: 14px;
  color: #2c2c2c;
  font-weight: 400;
  margin-bottom: 2px;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

/* Nilai Utama di Bawah Label */
.cell-value {
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: #111111;
  word-break: break-word;
}

/* Status Loading & Error */
.status-box {
  text-align: center;
  padding: 30px 16px;
  color: #666;
}

.status-box p {
  margin-top: 10px;
  font-size: 14px;
}

.status-box.error {
  color: #d32f2f;
}
</style>
