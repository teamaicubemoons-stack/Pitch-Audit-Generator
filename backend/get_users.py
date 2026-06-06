import os
import gspread
from google.oauth2.service_account import Credentials

def test():
    scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    creds_path = os.path.join(os.getcwd(), "service_account.json")
    creds = Credentials.from_service_account_file(creds_path, scopes=scope)
    client = gspread.authorize(creds)
    
    spreadsheet_url = "https://docs.google.com/spreadsheets/d/1fMbZzsr6tvTXc70cjs9rR3CPvqW6zPILr4DIJV0EFDY/edit"
    doc = client.open_by_url(spreadsheet_url)
    all_sheets = doc.worksheets()
    sheet = next((s for s in all_sheets if "Users" in s.title), all_sheets[0])
    
    records = sheet.get_all_records()
    for row in records:
        print(row)

test()
