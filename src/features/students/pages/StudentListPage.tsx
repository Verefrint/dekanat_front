import { useNavigate } from "react-router-dom";
import StudentTable from "../components/StudentTable.tsx";
import {Box, Button, Typography} from "@mui/material";


const StudentListPage = () => {
    const navigate = useNavigate();

    const handleAddStudent = () => {
        navigate("/students/create");
    };


    return <div>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4">Студенты</Typography>
            <Button variant="contained" color="primary" onClick={handleAddStudent}>
                Добавить студента
            </Button>
        </Box>
        <StudentTable />
    </div>;
};

export default StudentListPage;
