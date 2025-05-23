// src/features/kafedras/components/KafedraTable.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import AnimatedTableShell from '../../../components/AnimatedTableShell';
import { fetchKafedras } from '../kafedraSlice';
import { fetchInstitutes } from '../../institutes/instituteSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';

type SortOrder = 'asc' | 'desc';

/* ──────────────── helpers & constants ─────────────── */
const labels: Record<'name' | 'email' | 'room' | 'phone', string> = {
    name: 'Название',
    email: 'E-mail',
    room: 'Кабинет',
    phone: 'Телефон',
};

const columns = (Object.keys(labels) as (keyof typeof labels)[]).map((f) => ({
    field: f,
    label: labels[f],
}));

/* ───────────────────── component ─────────────────── */
const KafedraTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { kafedras, status } = useAppSelector((s) => s.kafedras);
    const { institutes } = useAppSelector((s) => s.institutes);

    /* ui state */
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<keyof typeof labels>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* fetch once */
    useEffect(() => {
        dispatch(fetchKafedras());
        dispatch(fetchInstitutes());
    }, [dispatch]);

    /* handlers */
    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const onSort = (field: keyof typeof labels) => {
        if (field === sortBy) {
            setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleChangePage = (_: unknown, p: number) => setPage(p);
    const handleChangeRows = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+e.target.value);
        setPage(0);
    };

    /* transforms */
    const filtered = useMemo(() => {
        const txt = search.toLowerCase();
        return kafedras.filter(
            (k) =>
                k.name.toLowerCase().includes(txt) ||
                k.email.toLowerCase().includes(txt) ||
                k.room.toLowerCase().includes(txt) ||
                k.phone.toLowerCase().includes(txt),
        );
    }, [kafedras, search]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const av = (a as any)[sortBy] as string;
            const bv = (b as any)[sortBy] as string;
            const va = av.toLowerCase();
            const vb = bv.toLowerCase();
            if (va < vb) return sortOrder === 'asc' ? -1 : 1;
            if (va > vb) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortBy, sortOrder]);

    const pageData = useMemo(() => {
        const start = page * rowsPerPage;
        return sorted.slice(start, start + rowsPerPage);
    }, [sorted, page, rowsPerPage]);

    /* helpers */
    const getInstituteName = (id: number) =>
        institutes.find((i) => i.id === id)?.name ?? 'Не указан';

    /* loading */
    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    /* ─────────── render ─────────── */
    return (
        <AnimatedTableShell title="Список кафедр">
            {/* search bar */}
            <TextField
                label="Поиск (название / e-mail / кабинет / телефон)"
                value={search}
                onChange={onSearch}
                fullWidth
                sx={{ mb: 3 }}
            />

            {/* table */}
            <TableContainer sx={{ maxHeight: 540 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((c) => (
                                <TableCell key={c.field}>
                                    <TableSortLabel
                                        active={sortBy === c.field}
                                        direction={sortOrder}
                                        onClick={() => onSort(c.field)}
                                    >
                                        {c.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Уч. данные</TableCell>
                            <TableCell>Институт</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pageData.map((k) => (
                            <TableRow
                                key={k.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/kafedras/${k.id}`)}
                            >
                                <TableCell>{k.name}</TableCell>
                                <TableCell>{k.email}</TableCell>
                                <TableCell>{k.room}</TableCell>
                                <TableCell>{k.phone}</TableCell>
                                <TableCell>
                                    <Box display="flex" justifyContent="center">
                                        <Badge
                                            color={k.credentialsNonExpired ? 'success' : 'error'}
                                            badgeContent={
                                                k.credentialsNonExpired ? 'Активен' : 'Истёк'
                                            }
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>{getInstituteName(k.instituteId)}</TableCell>
                            </TableRow>
                        ))}

                        {pageData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length + 2} align="center">
                                    <Typography variant="body2" sx={{ py: 4 }}>
                                        Кафедры не найдены 😕
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* pagination */}
            <TablePagination
                component="div"
                count={sorted.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRows}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </AnimatedTableShell>
    );
};

export default KafedraTable;
