import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, Container,
    CircularProgress, Box, TableSortLabel,
    TablePagination, Badge
} from '@mui/material';
import { useAppDispatch } from '../../../hooks/useAppDispatch.ts';
import { useAppSelector } from '../../../hooks/useAppSelector.ts';
import { fetchKafedras } from '../kafedraSlice.ts';
import { fetchInstitutes } from '../../institutes/instituteSlice.ts';
import { useNavigate } from 'react-router-dom';

const KafedraTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { kafedras, status } = useAppSelector(state => state.kafedras);
    const { institutes } = useAppSelector(state => state.institutes);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<keyof string>("name");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchKafedras());
        dispatch(fetchInstitutes());
    }, [dispatch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const handleSort = (field: keyof any) => {
        if (sortBy === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const getInstituteName = (id: number) => {
        const institute = institutes.find(inst => inst.id === id);
        return institute ? institute.name : 'Не указан';
    };

    const filteredKafedras = useMemo(() => {
        return kafedras.filter(kafedra => {
            const { name, email, room, phone } = kafedra;
            const searchLower = search.toLowerCase();
            const matchesSearch =
                name.toLowerCase().includes(searchLower) ||
                email.toLowerCase().includes(searchLower) ||
                room.toLowerCase().includes(searchLower) ||
                phone.toLowerCase().includes(searchLower);

            return matchesSearch;
        });
    }, [kafedras, search]);

    const sortedKafedras = useMemo(() => {
        return [...filteredKafedras].sort((a, b) => {
            const aField = a[sortBy as keyof typeof a];
            const bField = b[sortBy as keyof typeof b];
            const aVal = typeof aField === 'string' ? aField.toLowerCase() : aField;
            const bVal = typeof bField === 'string' ? bField.toLowerCase() : bField;

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredKafedras, sortBy, sortOrder]);

    const paginatedKafedras = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedKafedras.slice(start, start + rowsPerPage);
    }, [sortedKafedras, page, rowsPerPage]);

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <TextField
                label="Поиск по названию, адресу электронной почты, номеру комнаты или телефона"
                variant="outlined"
                fullWidth
                margin="normal"
                value={search}
                onChange={handleSearchChange}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['name', 'email', 'room', 'phone'].map((field) => (
                                <TableCell key={field}>
                                    <TableSortLabel
                                        active={sortBy === field}
                                        direction={sortOrder}
                                        onClick={() => handleSort(field)}
                                    >
                                        {({
                                            name: 'Название',
                                            email: 'Адрес электронной почты',
                                            room: 'Номер комнаты',
                                            phone: 'Номер телефона'
                                        } as Record<string, string>)[field]}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Статус учётных данных</TableCell>
                            <TableCell>Институт</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedKafedras.map(kafedra => (
                            <TableRow
                                key={kafedra.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/kafedras/${kafedra.id}`)}
                            >
                                <TableCell>{kafedra.name}</TableCell>
                                <TableCell>{kafedra.email}</TableCell>
                                <TableCell>{kafedra.room}</TableCell>
                                <TableCell>{kafedra.phone}</TableCell>
                                <TableCell>
                                    <Box display="flex" justifyContent="center">
                                        <Badge
                                            color={kafedra.credentialsNonExpired ? 'success' : 'error'}
                                            badgeContent={kafedra.credentialsNonExpired ? 'Активен' : 'Истёк'}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>{getInstituteName(kafedra.instituteId)}</TableCell>
                            </TableRow>
                        ))}
                        {paginatedKafedras.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Кафедры не найдены
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={sortedKafedras.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Container>
    );
};

export default KafedraTable;
