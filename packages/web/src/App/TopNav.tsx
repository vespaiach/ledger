import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import {
    MenuBookRounded as MenuBookRoundedIcon,
    SyncRounded as SyncRoundedIcon,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

import ListIcon from '../components/Icons/List';
import ChartIcon from '../components/Icons/Chart';
import SettingIcon from '../components/Icons/Setting';

const useStyles = makeStyles((theme) => ({
    appbarRoot: {
        background: 'white',
        color: theme.palette.text.primary,
    },
    logoRoot: {
        marginRight: theme.spacing(1),
        color: theme.palette.primary.dark,
    },
    tabsRoot: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'stretch',
        height: 48,
        marginLeft: theme.spacing(8),
        '& a': {
            color: theme.palette.common.black,
            textDecoration: 'none',
            fontSize: theme.typography.body1.fontSize,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
        },
        '& a + a': {
            marginLeft: theme.spacing(4),
        },
        '& .active::after': {
            display: 'block',
            height: 2,
            width: 20,
            bottom: 0,
            left: 0,
            background: 'red',
            content: ' ',
            position: 'absolute',
        },

        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    settingMenuRoot: {
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    hamburgerMenuRoot: {
        display: 'none',
        marginLeft: 'auto',
        [theme.breakpoints.down('xs')]: {
            display: 'block',
        },
    },
    subMenu: {
        minHeight: 48,
        background: theme.palette.primary.dark,
    },
    flexGrow: {
        flexGrow: 1,
    },
    divider: {
        height: 24,
    },
}));

interface TopNavProps {
    elevation?: number;
    onRefesh: () => void;
}

export default function TopNav({ elevation = 0, onRefesh }: TopNavProps) {
    const classes = useStyles();
    const popupState = usePopupState({ variant: 'popover', popupId: 'settingMenu' });

    return (
        <AppBar elevation={elevation} classes={{ root: classes.appbarRoot }}>
            <Toolbar variant="dense">
                <MenuBookRoundedIcon classes={{ root: classes.logoRoot }} />
                <Typography variant="h6">Ledger</Typography>
                <div className={classes.flexGrow} />
                <IconButton
                    aria-label="list of transactions"
                    title="list of transactions"
                    to="/transactions"
                    component={Link}>
                    <ListIcon />
                </IconButton>
                <IconButton
                    aria-label="transaction reports"
                    title="transaction reports"
                    to="/reports"
                    component={Link}>
                    <ChartIcon />
                </IconButton>
                <Divider orientation="vertical" classes={{ root: classes.divider }} />
                <IconButton
                    {...bindTrigger(popupState)}
                    edge="end"
                    aria-label="settings"
                    title="settings">
                    <SettingIcon />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                    <MenuItem
                        onClick={() => {
                            onRefesh();
                            popupState.close();
                        }}>
                        <ListItemIcon>
                            <SyncRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Re-fetch data" />
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
