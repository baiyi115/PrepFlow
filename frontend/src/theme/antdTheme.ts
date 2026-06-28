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
    colorBgContainer: colors.surface,
    colorBgElevated: isDark ? colors.gray200 : colors.surface,
    colorBorder: colors.gray200,
    colorBorderSecondary: colors.gray200,

    colorText: colors.gray900,
    colorTextSecondary: colors.gray600,
    colorTextTertiary: colors.gray400,

    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
    boxShadow: colors.shadowCard,
    boxShadowSecondary: colors.shadowElevated,
  },
  components: {
    Menu: {
      itemBg: colors.gray100,
      itemActiveBg: colors.primaryBg,
      itemColor: colors.gray600,
      itemSelectedColor: colors.primary,
      itemHoverBg: colors.gray100,
    },
    Layout: {
      headerBg: colors.gray50,
      bodyBg: colors.gray100,
      siderBg: colors.gray100,
      headerPadding: '0 24px',
    },
    Card: {
      paddingLG: 22,
      borderRadiusLG: 8,
      boxShadow: colors.shadowCard,
    },
    Button: {
      borderRadius: 6,
      primaryShadow: 'none',
      defaultShadow: `${colors.ringSubtle} 0 0 0 1px`,
    },
    Input: {
      borderRadius: 6,
    },
    Select: {
      borderRadius: 6,
    },
    Modal: {
      borderRadiusLG: 10,
    },
    Table: {
      headerBg: colors.surfaceMuted,
      headerColor: colors.gray700,
      rowHoverBg: colors.primaryBg,
      borderColor: colors.gray200,
    },
    Tag: {
      borderRadiusSM: 999,
    },
  },
});
