/* -----------------------------------------------------------------------
   AnimatedTableShell.tsx
   Generic wrapper for tables / large data views with a soft glass look
   -------------------------------------------------------------------- */

import React, { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/* ———————— props ———————— */
interface AnimatedTableShellProps {
    /** Optional heading shown above the table */
    title?: string;
    /** Your table (or any content) */
    children: ReactNode;
    /**
     * Max width of the paper card.
     * (💡 Tip: pass `"md"` for theme break-point, or a number e.g. 1200.)
     */
    maxWidth?: number | string;
    /** Paper elevation – defaults to 10 */
    elevation?: number;
    /** Padding inside the Paper – defaults to { xs:2, sm:3 } */
    padding?: any;
}

const AnimatedTableShell: React.FC<AnimatedTableShellProps> = ({
                                                                   title,
                                                                   children,
                                                                   maxWidth = 1100,
                                                                   elevation = 10,
                                                                   padding = { xs: 2, sm: 3 },
                                                               }) => (
    <Box
        sx={{
            position: 'relative',
            minHeight: '50vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
        }}
    >
        {/* blurred gradient background */}
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(120deg,#dfe9f3 0%,#ffffff 100%)',
                filter: 'blur(8px)',
                transform: 'scale(1.1)',
                zIndex: -1,
            }}
        />

        {/* animated card */}
        <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            style={{ width: '100%', maxWidth }}
        >
            <Paper
                elevation={elevation}
                sx={{
                    borderRadius: 4,
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    p: padding,
                }}
            >
                {title && (
                    <Typography variant="h5" align="center" mb={3}>
                        {title}
                    </Typography>
                )}

                {children}
            </Paper>
        </motion.div>
    </Box>
);

export default AnimatedTableShell;
