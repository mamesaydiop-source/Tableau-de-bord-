import pandas as pd
import openpyxl
import matplotlib.pyplot as plt

# Load financial data (replace with actual data loading if needed)
# Assuming a dictionary format for demonstration purposes
financial_data = {
    'Revenue': [100000, 120000, 140000],
    'Expenses': [80000, 90000, 95000],
    'Net Income': [20000, 30000, 45000]
}

# Create a DataFrame
df = pd.DataFrame(financial_data, index=['Q1', 'Q2', 'Q3'])

# Create an Excel writer object
with pd.ExcelWriter('SYSCOHADA_Dashboard.xlsx', engine='openpyxl') as writer:
    # Write the DataFrame to an Excel sheet
    df.to_excel(writer, sheet_name='Financial Data')

    # Create a new sheet for accounting
    accounting_df = pd.DataFrame({
        'Account': ['Cash', 'Accounts Receivable', 'Inventory'],
        'Balance': [50000, 20000, 15000]
    })
    accounting_df.to_excel(writer, sheet_name='Accounting Data')

    # Add more sheets as needed

    # Create a dashboard sheet
    dashboard = writer.book.create_sheet(title='Dashboard')
    for idx, col in enumerate(df.columns):
        chart = plt.bar(df.index, df[col], label=col)
        plt.title(f'{col} Over Quarters')
        plt.xlabel('Quarters')
        plt.ylabel(col)
        plt.legend()
        plt.savefig(f'{col}.png')
        plt.close()
        img = openpyxl.drawing.image.Image(f'{col}.png')
        dashboard.add_image(img, f'A{idx*10}')

# Save the workbook
print('Dashboard created successfully!')
