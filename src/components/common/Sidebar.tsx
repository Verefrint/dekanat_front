import React, { useState } from 'react';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Divider,
    Box,
    Menu,
    MenuItem,
    Typography,
    useTheme,
    useMediaQuery,
    Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutApi } from '../../features/auth/authSlice';

interface SidebarSubItem {
    label: string;
    href?: string;
    roles?: string[];
}

interface SidebarItem {
    label: string;
    href?: string;
    subItems?: SidebarSubItem[];
    roles?: string[];
}

interface SidebarProps {
    items: SidebarItem[];
    width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ items, width = 250 }) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.auth.user);
    const userRoles = user?.roles || [];

    const toggleDrawer = () => setMobileOpen(!mobileOpen);
    const toggleSubmenu = (label: string) => {
        setOpenItems(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const hasAccess = (itemRoles?: unknown) => {
        if (!Array.isArray(itemRoles) || itemRoles.length === 0) return true;
        return itemRoles.some(role => userRoles.includes(role));
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutApi()).unwrap();
            navigate('/auth');
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
        handleClose();
    };

    const drawerContent = (
        <Box display="flex" flexDirection="column" height="100%">
            {/* Верхняя часть со списками */}
            <Box flexGrow={1}>
                {!isDesktop && (
                    <Box display="flex" justifyContent="flex-end" p={1}>
                        <IconButton onClick={toggleDrawer}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                )}
                <Divider />
                <List>
                    {items.filter(hasAccess).map((item, index) => (
                        <Box key={index}>
                            {item.subItems ? (
                                <>
                                    <ListItem button onClick={() => toggleSubmenu(item.label)}>
                                        <ListItemText primary={item.label} />
                                        {openItems[item.label] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItem>
                                    <Collapse in={openItems[item.label]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.subItems.filter(hasAccess).map((subItem, subIndex) => (
                                                <ListItem
                                                    key={subIndex}
                                                    button
                                                    component={RouterLink}
                                                    to={subItem.href!}
                                                    sx={{ pl: 4 }}
                                                >
                                                    <ListItemText primary={subItem.label} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </>
                            ) : (
                                <ListItem button component={RouterLink} to={item.href!}>
                                    <ListItemText primary={item.label} />
                                </ListItem>
                            )}
                        </Box>
                    ))}
                </List>
            </Box>

            {/* Нижняя часть — авторизация */}
            <Box p={2} borderTop={`1px solid ${theme.palette.divider}`}>
                {user ? (
                    <Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                                <AccountCircle sx={{ mr: 1 }} />
                                <p>{user.email}</p>
                            </Box>
                            <IconButton size="small" onClick={handleMenu}>
                                <ExpandMoreIcon />
                            </IconButton>
                        </Box>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {user.roles.includes('ADMIN') && (
                                <MenuItem
                                    onClick={handleClose}
                                    component={RouterLink}
                                    to="/admin"
                                >
                                    Панель администратора
                                </MenuItem>
                            )}
                            <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Button
                        fullWidth
                        variant="outlined"
                        component={RouterLink}
                        to="/auth"
                    >
                        Войти
                    </Button>
                )}
            </Box>
        </Box>
    );

    return (
        <Box>
            {!isDesktop && (
                <IconButton onClick={toggleDrawer} sx={{ m: 1 }}>
                    <MenuIcon />
                </IconButton>
            )}
            <Drawer
                variant={isDesktop ? 'permanent' : 'temporary'}
                open={isDesktop || mobileOpen}
                onClose={toggleDrawer}
                PaperProps={{
                    sx: {
                        width,
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
                ModalProps={{ keepMounted: true }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;


echo "# dekanat_front" >> README.md
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Verefrint/dekanat_front.git
git push -u origin main