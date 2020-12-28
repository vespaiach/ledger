import { SvgIcon } from '@material-ui/core';

export default function PlusOne(props) {
    return (
        <SvgIcon {...props}>
            <title>{props.title || 'Plus One'}</title>
            <desc>Plus One</desc>
            <path d="M10,8V12H14V14H10V18H8V14H4V12H8V8H10M14.5,6.08L19,5V18H17V7.4L14.5,7.9V6.08Z" />
        </SvgIcon>
    );
}