import { colors, radius } from './tokens';
import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
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
    colorBorder: colors.gray200,
    colorBorderSecondary: colors.gray200,

    colorText: colors.gray900,
    colorTextSecondary: colors.gray600,
    colorTextTertiary: colors.gray400,

    borderRadius: radius.base,
  },
  components: {
    Menu: {
      colorItemBg: colors.gray800,
      colorItemBgActive: colors.gray900,
      colorItemText: colors.gray300,
      colorItemTextSelected: colors.gray50,
      colorItemBgHover: colors.gray700,
    },
    Layout: {
      headerBg: colors.gray50,
      bodyBg: colors.gray100,
      siderBg: colors.gray800,
      headerPadding: '0 24px',
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: radius.card,
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(217,119,6,0.15)',
    },
  },
};
