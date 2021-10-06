# PrecisionLink Validation Notebooks File Information
|Script Name|Description|
|--|--|
|1_PICSURE_API_101.ipynb	|This API is for PL PIC-SURE It connects to the specified data source, queries and retrieve counts for hardcoded sample paths ( for numerical, categorical and combination of numerical and categorical filter ) from the HPDS database and prints out patient counts.
|Demographics_PICSURE_API_101.ipynb	| As part of this script aggregated counts from Picsure API dictionary for demographics node is compared to aggregated data counts of demographics node from the source database.
|Demographics_PICSURE_API_101.sql	| Datafile for Demographics_PICSURE_API _101.ipynb is generated using this script - saved as file data_demo_from_db.csv.
|Labs_PICSURE_API_101.ipynb	| As part of this script aggregated counts from Picsure API dictionary for Lab Results node is compared to aggregated data counts of Lab Result node from the source database.
|Labs_PICSURE_API_101.sql	| Datafile for Labs_PICSURE_API_101.ipynb is generated using this script - saved as file data_lab_from_db.csv
|BioSpecimens_PICSURE_API_validations.ipynb	| For Bio Speciemens - categorical node, data from the database (data file Bio_Data_Ext_1.csv) is compared for counts using Pic-Sure API
|BioSpecimens_PICSURE_API_validations.sql	| Use this script to extract data from database for BioSpecimens_PICSURE_API_validations.ipynb - saved as filename -Bio_Data_Ext_1.csv
|CTakesNotes_PICSURE_API_validations.ipynb	| For CTakesNotes categorical node, data from the database (data file CTakesNotes_Data_Ext _1.csv ) is compared for counts using Pic-Sure API
|CtakeNotes_PICSURE_API_validations.sql	| Use this script to extract data from database for CTakesNotes_PICSURE_API_validations.ipynb saved as - filename - CTakesNotes_Data_Ext_1.csv
|Demographics_PICSURE_API_validations.ipynb	| For Demographics - categorical node, data from the database (data file Demo_Data_Ext_1.csv ) is compared for counts using Pic-Sure API
|Demographics_PICSURE_API_validations.sql	| Use this script to extract data from database for Demographics_PICSURE_API_validations.ipynb saved as - filename - Demo_Data_Ext_1.csv
|Diagnosis_PICSURE_API_validations.ipynb	| For Diagnosis - categorical node, data from the database (data file Diag_Data_Ext_1.csv ) is compared for counts using Pic-Sure API
|Diagnosis_PICSURE_API_validations.sql	| Use this script to extract data from database for Diagnosis_PICSURE_API_validations.ipynb saved as - filename - Diag_Data_Ext_1.csv
|Medications_PICSURE_API_validations.ipynb	| For Medications - categorical node, data from the database (data file Med_Data_Ext_1.csv , Med_Data_Ext_2.csv) is compared for counts using Pic-Sure API
|Medications_PICSURE_API_validations.sql	| Use this script to extract data from database for Medications_PICSURE_API_validations.ipynb saved as - filename - Med_Data_Ext_1.csv, Med_Data_Ext_2.csv
|Procedures_PICSURE_API_validations.ipynb	| For Procedures - categorical node, data from the database (data file Procs_Data_Ext_1.csv ) is compared for counts using Pic-Sure API
|Procedures_PICSURE_API_validations.sql	| Use this script to extract data from database for Procedures_PICSURE_API_validations.ipynb saved as - filename - Procs_Data_Ext_1.csv
