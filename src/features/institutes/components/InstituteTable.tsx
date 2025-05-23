// src/features/institutes/components/InstituteTable.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
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
import { fetchInstitutes } from '../instituteSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';

type SortOrder = 'asc' | 'desc';

/* ──────────────── helpers & constants ─────────────── */
const labels: Record<'email' | 'name' | 'phone', string> = {
    email: 'E-mail',
    name: 'Название',
    phone: 'Телефон',
};

const columns = (Object.keys(labels) as (keyof typeof labels)[]).map((f) => ({
    field: f,
    label: labels[f],
}));

/* ───────────────────── component ─────────────────── */
const InstituteTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { institutes, status } = useAppSelector((s) => s.institutes);

    /* ui state */
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<keyof typeof labels>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* fetch once */
    useEffect(() => {
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
        return institutes.filter(
            (i) =>
                i.name.toLowerCase().includes(txt) ||
                i.email.toLowerCase().includes(txt) ||
                i.phone.toLowerCase().includes(txt),
        );
    }, [institutes, search]);

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
        <AnimatedTableShell title="Список институтов">
            {/* search bar */}
            <TextField
                label="Поиск (название / e-mail / телефон)"
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pageData.map((i) => (
                            <TableRow
                                key={i.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/institutes/${i.id}`)}
                            >
                                <TableCell>{i.email}</TableCell>
                                <TableCell>{i.name}</TableCell>
                                <TableCell>{i.phone}</TableCell>
                            </TableRow>
                        ))}

                        {pageData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center">
                                    <Typography variant="body2" sx={{ py: 4 }}>
                                        Институты не найдены 😕
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

export default InstituteTable;
