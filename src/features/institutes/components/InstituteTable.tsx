
import { fetchInstitutes } from '../instituteSlice';
import { useAppDispatch } from "../../../hooks/useAppDispatch.ts";
import { useAppSelector } from '../../../hooks/useAppSelector.ts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material';

const InstituteTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { institutes, status } = useAppSelector(state => state.institutes);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<keyof string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
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

    const filteredInstitutes = useMemo(() => {
        return institutes.filter(institute => {
            const { email, name, phone } = institute;
            const searchLower = search.toLowerCase();
            const matchesSearch =
                email.toLowerCase().includes(searchLower) ||
                name.toLowerCase().includes(searchLower) ||
                phone.toLowerCase().includes(searchLower);

            return matchesSearch;
        });
    }, [institutes, search]);

    const sortedInstitutes = useMemo(() => {
        return [...filteredInstitutes].sort((a, b) => {
            const aField = a[sortBy as keyof typeof a];
            const bField = b[sortBy as keyof typeof b];

            const aVal = typeof aField === 'string' ? aField.toLowerCase() as string | number : aField as string | number;
            const bVal = typeof bField === 'string' ? bField.toLowerCase() as string | number : bField as string | number;

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredInstitutes, sortBy, sortOrder]);

    const paginatedInstitutes = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedInstitutes.slice(start, start + rowsPerPage);
    }, [sortedInstitutes, page, rowsPerPage]);

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
                label="Поиск по названию, адресу электронной почты или телефону"
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
                            {['email', 'name', 'phone'].map((field) => (
                                <TableCell key={field}>
                                    <TableSortLabel
                                        active={sortBy === field}
                                        direction={sortOrder}
                                        onClick={() => handleSort(field)}
                                    >
                                        {({
                                            email: 'Адрес электронной почты',
                                            name: 'Название',
                                            phone: 'Номер телефона'
                                        } as Record<string, string>)[field]}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedInstitutes.map(institute => (
                            <TableRow
                                key={institute.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/institutes/${institute.id}`)}
                            >
                                <TableCell>{institute.email}</TableCell>
                                <TableCell>{institute.name}</TableCell>
                                <TableCell>{institute.phone}</TableCell>
                            </TableRow>
                        ))}
                        {paginatedInstitutes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Институты не найдены
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={sortedInstitutes.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Container>
    );
};

export default InstituteTable;
