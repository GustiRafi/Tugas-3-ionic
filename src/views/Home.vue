<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Praktikum 8 - Daftar User</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Daftar User</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <!-- Header & Action Card -->
        <ion-card class="action-card">
          <ion-card-header>
            <div class="header-badge-wrapper">
              <ion-badge color="primary">RESTful API</ion-badge>
              <ion-badge v-if="dataUsers" color="success">{{ dataUsers.length }} User Dimuat</ion-badge>
            </div>
            <ion-card-title class="card-title-custom">Daftar User</ion-card-title>
            <ion-card-subtitle>Sumber: jsonplaceholder.typicode.com/users</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p class="desc-text">
              Klik tombol di bawah untuk mengambil data pengguna menggunakan Axios dan service EndPointAccess.
            </p>
            <div class="btn-wrapper">
              <ion-button
                expand="block"
                shape="round"
                color="primary"
                :disabled="isLoading"
                @click="ambilData"
              >
                <ion-spinner v-if="isLoading" name="crescent" class="btn-spinner"></ion-spinner>
                <span v-else>Ambil data</span>
              </ion-button>
            </div>

            <!-- View Switcher for Mobile -->
            <div v-if="dataUsers && dataUsers.length > 0" class="view-switcher">
              <ion-segment v-model="selectedView" value="cards">
                <ion-segment-button value="cards">
                  <ion-label>Mobile Cards</ion-label>
                </ion-segment-button>
                <ion-segment-button value="table">
                  <ion-label>Format Tabel</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Initial Placeholder State -->
        <div v-if="!dataUsers && !isLoading" class="empty-state">
          <div class="empty-icon">👥</div>
          <p class="empty-text">Belum ada data. Silakan tekan tombol <strong>Ambil data</strong> di atas.</p>
        </div>

        <!-- Mobile-first Cards View -->
        <div v-if="dataUsers && selectedView === 'cards'" class="user-cards-list">
          <ion-card v-for="user in dataUsers" :key="'card-' + user.id" class="user-item-card">
            <ion-card-header>
              <div class="user-card-header-row">
                <span class="user-id-badge">#{{ user.id }}</span>
                <span class="company-badge">{{ user.company?.name }}</span>
              </div>
              <ion-card-title class="user-name">{{ user.name }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="user-info-row">
                <span class="info-label">📧 Email:</span>
                <a :href="'mailto:' + user.email" class="email-link">{{ user.email }}</a>
              </div>
              <div class="user-info-row">
                <span class="info-label">🏢 Perusahaan:</span>
                <span class="company-text">{{ user.company?.name }}</span>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Table View (Sesuai modul praktikum halaman 8.7 & 8.9) -->
        <div v-if="dataUsers && selectedView === 'table'" class="table-responsive">
          <table class="center">
            <thead>
              <tr>
                <th>id</th>
                <th>Name</th>
                <th>E-mail</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in dataUsers" :key="user.id">
                <td class="text-center font-bold">{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>
                  <a :href="'mailto:' + user.email" class="table-email">{{ user.email }}</a>
                </td>
                <td>{{ user.company?.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import EndPointAccess from '@/services/EndPointAccess';

let resData: any;

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  },
  data() {
    return {
      dataUsers: null as any[] | null,
      isLoading: false,
      selectedView: 'cards',
    };
  },
  methods: {
    async ambilData() {
      this.isLoading = true;
      try {
        resData = new EndPointAccess('https://jsonplaceholder.typicode.com/users');
        const response: any = await resData.getRes();
        this.dataUsers = response.data;
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<style scoped>
#container {
  max-width: 680px;
  margin: 0 auto;
  padding: 8px 4px 32px 4px;
}

.action-card {
  margin: 8px 4px 16px 4px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.header-badge-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title-custom {
  font-size: 1.4rem;
  font-weight: 700;
}

.desc-text {
  font-size: 0.92rem;
  color: var(--ion-color-medium, #666);
  margin-bottom: 16px;
  line-height: 1.4;
}

.btn-wrapper {
  margin: 8px 0;
}

.btn-spinner {
  width: 22px;
  height: 22px;
}

.view-switcher {
  margin-top: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  background: var(--ion-card-background, #fff);
  border-radius: 16px;
  margin: 12px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  color: var(--ion-color-medium, #777);
  font-size: 0.95rem;
  margin: 0;
}

/* Mobile-first Cards */
.user-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 4px;
}

.user-item-card {
  margin: 0;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border-left: 4px solid var(--ion-color-primary, #3880ff);
  transition: transform 0.15s ease;
}

.user-item-card:active {
  transform: scale(0.99);
}

.user-card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.user-id-badge {
  background: var(--ion-color-primary, #3880ff);
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 12px;
}

.company-badge {
  background: rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.12);
  color: var(--ion-color-primary, #3880ff);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.user-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--ion-text-color, #222);
}

.user-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  margin-top: 6px;
  word-break: break-all;
}

.info-label {
  font-weight: 600;
  color: var(--ion-color-medium, #666);
  min-width: 95px;
}

.email-link {
  color: var(--ion-color-primary, #3880ff);
  text-decoration: none;
}

.company-text {
  color: var(--ion-text-color, #333);
}

/* Mobile-first Responsive Table */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 8px 4px;
  background: var(--ion-card-background, #fff);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.center {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.center th {
  background-color: var(--ion-color-primary, #3880ff);
  color: #fff;
  font-weight: 600;
  padding: 10px 12px;
  text-align: left;
  white-space: nowrap;
}

.center td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--ion-color-light-shade, #e6e6e6);
  color: var(--ion-text-color, #333);
}

.center tr:last-child td {
  border-bottom: none;
}

.center tr:nth-child(even) td {
  background-color: rgba(var(--ion-color-light-rgb, 244, 245, 248), 0.5);
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: 700;
}

.table-email {
  color: var(--ion-color-primary, #3880ff);
  text-decoration: none;
}
</style>
