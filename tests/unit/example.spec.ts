import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Home from '@/views/Home.vue';
import EndPointAccess from '@/services/EndPointAccess';

describe('Home.vue & EndPointAccess', () => {
  test('EndPointAccess initializes URL correctly', () => {
    const service = new EndPointAccess('https://jsonplaceholder.typicode.com/users');
    expect(service.theUrl).toBe('https://jsonplaceholder.typicode.com/users');
  });

  test('renders Home view with button Ambil data', () => {
    const wrapper = mount(Home);
    expect(wrapper.text()).toContain('Daftar User');
    expect(wrapper.text()).toContain('Ambil data');
  });
});
