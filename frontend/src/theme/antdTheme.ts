import type { ThemeConfig } from 'antd';
import type { ColorPalette } from './tokens';

export const getAntdTheme = (colors: ColorPalette, isDark: boolean): ThemeConfig => ({
  token: {
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryHover,
    colorPrimaryActive: colors.primaryActive,
    colorPrimaryBg: colors.primaryBg,
    colorPrimaryBorder: colors.primaryBorder,

    colorSuccess: colors.success,
    colorSuccessBg: colors.successBg,
    colorError: colors.error,
    colorErrorBg: colors.errorBg,
    colorWarning: colors.warning,
    colorWarningBg: colors.warningBg,

    colorBgLayout: colors.gray100,
    colorBgContainer: colors.gray50,
    colorBgElevated: isDark ? colors.gray200 : '#fff',
    colorBorder: colors.gray300,
    colorBorderSecondary: colors.gray200,

    colorText: colors.gray900,
    colorTextSecondary: colors.gray600,
    colorTextTertiary: colors.gray400,

    borderRadius: 8,
  },
  components: {
    Menu: {
      colorItemBg: colors.gray100,
      colorItemBgActive: colors.primaryBg,
      colorItemText: colors.gray600,
      colorItemTextSelected: colors.primary,
      colorItemBgHover: colors.gray100,
    },
    Layout: {
      headerBg: colors.gray50,
      bodyBg: colors.gray100,
      siderBg: colors.gray100,
      headerPadding: '0 24px',
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: 16,
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(217,119,6,0.15)',
    },
  },
});
