import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Home = () => {
    const [lab, setLab] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [counts, setCounts] = useState({});
    const [signatures, setSignatures] = useState({});
    const [errors, setErrors] = useState({
        lab: '',
        fromDate: '',
        toDate: '',
        counts: {},
        signatures: '',
    });

    const handleLabChange = (event) => {
        setLab(event.target.value);
        setErrors((prevErrors) => ({ ...prevErrors, lab: '' }));
    };

    const handleDateChange = (field, value) => {
        if (field === 'from') {
            setFromDate(value);
            setErrors((prevErrors) => ({ ...prevErrors, fromDate: '' }));
        } else {
            setToDate(value);
            setErrors((prevErrors) => ({ ...prevErrors, toDate: '' }));
        }
    };

    const handleCountChange = (item, value) => {
        if (value < 0) {
            return; // Prevent negative values
        }
        setCounts((prevCounts) => ({ ...prevCounts, [item]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, counts: { ...prevErrors.counts, [item]: '' } }));
    };

    const handleSignatureChange = (index, file) => {
        setSignatures((prevSignatures) => ({ ...prevSignatures, [index]: file }));
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const generateReport = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
    
        // Add the lab name centered
        doc.setFontSize(16);
        doc.text(`${lab}`, pageWidth / 2, 30, { align: 'center' });
    
        // Add the report title centered
        doc.setFontSize(12);
        doc.text('Lab Log Book', pageWidth / 2, 40, { align: 'center' });
    
        // Add the maintenance date range centered
        doc.text(`Maintenance from: ${formatDate(fromDate)} to: ${formatDate(toDate)}`, pageWidth / 2, 50, { align: 'center' });
    
        // Add the table
        const equipmentData = equipmentItems.map((item, index) => [index + 1, item, counts[item] || '']);
        doc.autoTable({
            head: [['S.No', 'Equipment', 'Total No.of Equipments']],
            body: equipmentData,
            startY: 60,
            columnStyles: {
                0: { halign: 'center' },
                1: { halign: 'center' },
                2: { halign: 'center' }
            },
            headStyles: {
                halign: 'center' // Center align header text
            },
        });
    
        // Add the signature label
        const signatureLabel = 'Lab Incharge Signatures:';
        doc.setFontSize(12);
        doc.text(signatureLabel, 20, doc.autoTable.previous.finalY + 20);
    
        // Add signatures
        const signaturesArray = Object.values(signatures);
        const signatureWidth = 50;
        const signatureHeight = 20;
        const margin = 20;
        let currentX = margin;
        let currentY = doc.autoTable.previous.finalY + 30;
    
        signaturesArray.forEach((signature, index) => {
            if (signature) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const imgData = e.target.result;
                    if (currentX + signatureWidth > pageWidth - margin) {
                        currentX = margin;
                        currentY += signatureHeight + 10;
                    }
                    doc.addImage(imgData, 'PNG', currentX, currentY, signatureWidth, signatureHeight);
                    currentX += signatureWidth + 10;
                    if (index === signaturesArray.length - 1) {
                        doc.save('Lab_Log_Book_Report.pdf');
                        clearFields();
                    }
                };
                reader.readAsDataURL(signature);
            } else {
                if (currentX + signatureWidth > pageWidth - margin) {
                    currentX = margin;
                    currentY += signatureHeight + 10;
                }
                currentX += signatureWidth + 10;
            }
        });
    
        if (signaturesArray.every(signature => !signature)) {
            doc.save('Lab_Log_Book_Report.pdf');
            clearFields();
        }
    };
    
    
    const handleSubmit = () => {
        let isValid = true;
        const newErrors = {
            lab: '',
            fromDate: '',
            toDate: '',
            counts: {},
            signatures: '',
        };
    
        if (!lab) {
            newErrors.lab = 'Please select a lab';
            isValid = false;
        }
    
        if (!fromDate) {
            newErrors.fromDate = 'Please select a from date';
            isValid = false;
        }
    
        if (!toDate) {
            newErrors.toDate = 'Please select a to date';
            isValid = false;
        }
    
        equipmentItems.forEach(item => {
            if (counts[item] === undefined || counts[item] === '') {
                newErrors.counts[item] = 'Please enter count';
                isValid = false;
            }
        });
    
        // Check if at least one signature is provided
        if (Object.keys(signatures).length === 0 || Object.values(signatures).every(file => !file)) {
            newErrors.signatures = 'At least one signature is required';
            isValid = false;
        }
    
        setErrors(newErrors);
    
        if (isValid) {
            generateReport();
        }
    };

    const clearFields = () => {
        setLab('');
        setFromDate('');
        setToDate('');
        setCounts({});
        setSignatures({});
        setErrors({
            lab: '',
            fromDate: '',
            toDate: '',
            counts: {},
            signatures: '',
        });
    };

    const equipmentItems = [
        'Mac Monitors', 'Dell Monitors', 'Mac Keyboards', 'Dell Keyboards',
        'Mac Mouses', 'Dell Mouses', 'Cables','Connectors', 'Chairs', 
        'LCD Screens', 'Glass Board', 'AC Remotes', 'LCD Remote', 'Notice Boards',
    ];

    return (
        <Container
            disableGutters
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                padding: 2,
                marginTop: '120px',
                marginBottom: '120px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.3rem', md: '1.6rem' }, color: '#1976d2', textAlign: 'center' }}>
                Lab Log Book
            </Typography>

            <FormControl fullWidth margin="normal" sx={{ maxWidth: '400px' }}>
                <InputLabel
                    id="lab-select-label"
                    sx={{
                        textDecoration: 'none',
                        color: '#1976d2', // Custom color for label
                    }}
                >
                    Select Lab
                </InputLabel>
                <Select
                    labelId="lab-select-label"
                    value={lab}
                    onChange={handleLabChange}
                    sx={{ backgroundColor: 'white' }}
                    required
                    error={!!errors.lab}
                >
                    <MenuItem value="Behaviour and Analytical Lab">Behaviour and Analytical Lab</MenuItem>
                    <MenuItem value="Tagore Hall Dell Lab">Tagore Hall(Dell Lab - 115)</MenuItem>
                </Select>
                <Typography color="error" variant="caption">{errors.lab}</Typography>
            </FormControl>

            <Typography variant="subtitle1" gutterBottom sx={{ color: '#1976d2' }}>
                Lab Maintenance Date
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2} my={2} sx={{ maxWidth: '400px', width: '100%' }}>
                <TextField
                    label="From"
                    type="date"
                    value={fromDate}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ backgroundColor: 'white', flex: 1 }}
                    required
                    error={!!errors.fromDate}
                />
                <TextField
                    label="To"
                    type="date"
                    value={toDate}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ backgroundColor: 'white', flex: 1 }}
                    required
                    error={!!errors.toDate}
                />
            </Box>

            <TableContainer component={Paper} sx={{ marginY: 2, maxWidth: '800px', width: '100%' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', textAlign: 'center' }}>S.No</TableCell>
                            <TableCell sx={{ color: 'white', textAlign: 'center' }}>Equipment</TableCell>
                            <TableCell sx={{ color: 'white', textAlign: 'center' }}>Total No.of Equipments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {equipmentItems.map((item, index) => (
                            <TableRow key={item}>
                                <TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>{item}</TableCell>
                                <TableCell sx={{ color: 'white', textAlign: 'center' }}>
                                    <TextField
                                        type="number"
                                        value={counts[item] || ''}
                                        onChange={(e) => handleCountChange(item, e.target.value)}
                                        InputProps={{ inputProps: { min: 0 } }}
                                        // fullWidth
                                        required
                                        error={!!errors.counts[item]}
                                    />
                                    <Typography color="error" variant="caption">{errors.counts[item]}</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="subtitle1" gutterBottom sx={{ color: '#1976d2' }}>
                Add Signatures
            </Typography>
            {Object.keys(signatures).map((key, index) => (
                <Box key={index} display="flex" gap={2} my={1}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureChange(index, e.target.files[0])}
                    />
                </Box>
            ))}
            <Box display="flex" gap={2} my={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSignatures((prev) => ({ ...prev, [Object.keys(signatures).length]: null }))}
                >
                    Add More Signature
                </Button>
            </Box>

            <Box mt={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Generate Report
                </Button>
            </Box>
        </Container>
    );
};

export default Home;
