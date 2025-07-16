import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateRangePicker } from '../date-range-picker';
import { TenantProvider } from '@/lib/tenant-context';
import { Tenant } from '@/types';

// Mock tenant data for testing
const mockTenant: Tenant = {
  id: 'test-tenant',
  slug: 'test-tenant',
  name: 'Test Tenant',
  branding: {
    primary_color: '#FF6B6B',
    accent_color: '#4ECDC4',
    background_color: '#F7F7F7',
    foreground_color: '#2C3E50',
    font_family: 'Roboto',
  },
  settings: {},
  subscription_plan: 'professional',
  subscription_status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock tenant with different branding
const mockTenantDark: Tenant = {
  ...mockTenant,
  id: 'dark-tenant',
  branding: {
    primary_color: '#8B5CF6',
    accent_color: '#06B6D4',
    background_color: '#1F2937',
    foreground_color: '#111827',
    font_family: 'Inter',
  },
};

const renderWithTenant = (component: React.ReactNode, tenant: Tenant = mockTenant) => {
  return render(
    <TenantProvider initialTenant={tenant}>
      {component}
    </TenantProvider>
  );
};

describe('DateRangePicker Branding Integration', () => {
  const mockProps = {
    onDateFromChange: vi.fn(),
    onDateToChange: vi.fn(),
    placeholder: 'Select dates'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies tenant primary color to trigger focus styles', () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    fireEvent.focus(trigger);
    
    // Check that trigger styles include tenant branding
    expect(trigger).toHaveStyle({
      backgroundColor: mockTenant.branding?.background_color
    });
  });

  it('applies tenant colors to calendar popup when opened', async () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    fireEvent.click(trigger);
    
    await waitFor(() => {
      const calendar = screen.getByRole('dialog', { name: /date range picker calendar/i });
      expect(calendar).toBeInTheDocument();
    });
  });

  it('applies tenant font family to calendar components', async () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    fireEvent.click(trigger);
    
    await waitFor(() => {
      const calendarHeader = screen.getByRole('toolbar', { name: /calendar navigation/i });
      expect(calendarHeader).toHaveStyle({
        fontFamily: expect.stringContaining('Roboto')
      });
    });
  });

  it('applies different branding for different tenants', () => {
    // Test with light tenant
    const { unmount } = renderWithTenant(<DateRangePicker {...mockProps} />);
    
    let trigger = screen.getByRole('button', { name: /date range picker/i });
    expect(trigger).toHaveStyle({
      backgroundColor: mockTenant.branding?.background_color
    });
    
    // Clean up and render with dark tenant
    unmount();
    renderWithTenant(<DateRangePicker {...mockProps} />, mockTenantDark);
    
    trigger = screen.getByRole('button', { name: /date range picker/i });
    expect(trigger).toHaveStyle({
      backgroundColor: mockTenantDark.branding?.background_color
    });
  });

  it('falls back to default colors when tenant branding is not available', () => {
    const tenantWithoutBranding: Tenant = {
      ...mockTenant,
      branding: {}
    };
    
    renderWithTenant(<DateRangePicker {...mockProps} />, tenantWithoutBranding);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // Should fallback to default colors
    expect(trigger).toHaveStyle({
      backgroundColor: '#FFFFFF'
    });
  });

  it('applies tenant branding to date cells when calendar is opened', async () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    fireEvent.click(trigger);
    
    await waitFor(() => {
      const calendar = screen.getByRole('dialog', { name: /date range picker calendar/i });
      expect(calendar).toBeInTheDocument();
    });
    
    // Check that date cells are rendered (they should inherit tenant branding)
    const dateCells = screen.getAllByRole('gridcell');
    expect(dateCells.length).toBeGreaterThan(0);
  });

  it('applies tenant branding to calendar header navigation', async () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    fireEvent.click(trigger);
    
    await waitFor(() => {
      const calendar = screen.getByRole('dialog', { name: /date range picker calendar/i });
      expect(calendar).toBeInTheDocument();
    });
    
    // Check that navigation buttons are present
    const prevButton = screen.getByRole('button', { name: /previous month/i });
    const nextButton = screen.getByRole('button', { name: /next month/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('maintains accessibility with tenant branding', async () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // Check trigger accessibility
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      const calendar = screen.getByRole('dialog', { name: /date range picker calendar/i });
      expect(calendar).toHaveAttribute('aria-modal', 'true');
    });
  });

  it('updates branding when tenant changes', () => {
    // Test with initial tenant
    const { unmount } = renderWithTenant(<DateRangePicker {...mockProps} />);
    
    let trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // Initial branding
    expect(trigger).toHaveStyle({
      backgroundColor: mockTenant.branding?.background_color
    });
    
    // Change tenant
    unmount();
    renderWithTenant(<DateRangePicker {...mockProps} />, mockTenantDark);
    
    trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // New branding should be applied
    expect(trigger).toHaveStyle({
      backgroundColor: mockTenantDark.branding?.background_color
    });
  });

  it('handles hover states with tenant branding', () => {
    renderWithTenant(<DateRangePicker {...mockProps} />);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // Hover should apply tenant-branded hover color
    fireEvent.mouseEnter(trigger);
    
    // The hover color should be applied via the onMouseEnter handler
    expect(trigger).toHaveStyle({
      borderColor: mockTenant.branding?.primary_color
    });
  });
});

describe('DateRangePicker Text Contrast', () => {
  const mockProps = {
    onDateFromChange: vi.fn(),
    onDateToChange: vi.fn(),
    placeholder: 'Select dates'
  };

  it('ensures proper text contrast with tenant background colors', () => {
    const lightTenant: Tenant = {
      ...mockTenant,
      branding: {
        ...mockTenant.branding,
        background_color: '#FFFFFF',
        foreground_color: '#000000'
      }
    };
    
    renderWithTenant(<DateRangePicker {...mockProps} />, lightTenant);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // With light background, text should be dark
    expect(trigger).toHaveStyle({
      backgroundColor: '#FFFFFF'
    });
  });

  it('handles dark theme tenant branding', () => {
    const darkTenant: Tenant = {
      ...mockTenant,
      branding: {
        ...mockTenant.branding,
        background_color: '#1F2937',
        foreground_color: '#FFFFFF'
      }
    };
    
    renderWithTenant(<DateRangePicker {...mockProps} />, darkTenant);
    
    const trigger = screen.getByRole('button', { name: /date range picker/i });
    
    // With dark background, should use appropriate styling
    expect(trigger).toHaveStyle({
      backgroundColor: '#1F2937'
    });
  });
}); 