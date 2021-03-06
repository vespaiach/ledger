import { SvgIcon } from '@material-ui/core';

export default function LineChart({ title = 'Annually', ...rest }) {
  return (
    <SvgIcon {...rest}>
      <title>{title}</title>
      <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
    </SvgIcon>
  );
}
