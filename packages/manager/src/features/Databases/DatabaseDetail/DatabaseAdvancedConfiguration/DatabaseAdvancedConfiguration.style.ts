import { styled } from '@mui/material/styles';

import { StyledValueGrid } from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

export const StyledConfigValue = styled(StyledValueGrid, {
  label: 'StyledValueGrid',
})(({ theme }) => ({
  padding: `${theme.spacing(0.5)}
            ${theme.spacing(1.9)}
            ${theme.spacing(0.5)}
            ${theme.spacing(0.8)}`,
}));

export const GroupHeader = styled('div')(({ theme }) => ({
  background:
    theme.palette.mode === 'dark' ? theme.color.grey9 : theme.palette.grey[200],
  color: theme.color.headline,
  font: "700 0.75rem/1rem 'Nunito Sans'",
  fontSize: '0.8rem',
  padding: '8px 12px',
  position: 'sticky',
  textTransform: 'uppercase',
  top: 0,
  zIndex: 1,
}));
export const GroupItems = styled('ul')(({ theme }) => ({
  color: theme.color.headline,
  padding: 0,
}));
