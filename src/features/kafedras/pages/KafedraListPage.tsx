import { useNavigate } from "react-router-dom";
import KafedraTable from "../components/KafedraTable";
import {Box, Button, Typography} from "@mui/material";


const KafedraListPage = () => {
    const navigate = useNavigate();

    const handleAddKafedra = () => {
        navigate("/kafedras/create");
    };


    return <div>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4">Кафедры</Typography>
            <Button variant="contained" color="primary" onClick={handleAddKafedra}>
                Добавить кафедру
            </Button>
        </Box>
        <KafedraTable />
    </div>;
};

export default KafedraListPage;
