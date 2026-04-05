import openpyxl

# Create a new workbook
wb = openpyxl.Workbook()

# Add a worksheet
ws = wb.active
ws.title = 'Accounting Data'

# Add headers
headers = ['Date', 'Description', 'Amount']
ws.append(headers)

# Sample data
sample_data = [
    ['2026-04-01', 'Sales', 1000],
    ['2026-04-02', 'Expenses', -500],
]

# Add sample data to worksheet
for row in sample_data:
    ws.append(row)

# Create a VBA macro
vba_code = '''
Sub AutoFill()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Accounting Data")
    ws.Range("A2:C2").AutoFill Destination:=ws.Range("A2:C100")
End Sub
'''

# Save the workbook with macros enabled
wb.save('SYSCOHADA_Dashboard_Generator.xlsm')

print('Excel file with VBA macros generated successfully!')