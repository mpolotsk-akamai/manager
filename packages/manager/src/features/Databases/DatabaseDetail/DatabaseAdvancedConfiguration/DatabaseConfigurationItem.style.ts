import { Box, Chip } from '@linode/ui';
import { styled } from '@mui/material';

export const StyledWrapper = styled(Box, {
  label: 'StyledWrapper',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
  // padding: theme.spacing(1.3),
}));

export const StyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  backgroundColor: theme.color.grey5,
  padding: theme.spacing(1.3),
  minWidth: '90%',
}));

export const StyledChip = styled(Chip, {
  label: 'StyledChip',
})(({ theme }) => ({
  backgroundColor: 'rgba(206, 154, 0, 0.12)',
  color: '#C25D05',
  font: theme.font.bold,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
}));
