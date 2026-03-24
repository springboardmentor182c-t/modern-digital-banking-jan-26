from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print('Registering user...')
res = client.post('/auth/register', json={
    'first_name': 'E2E',
    'last_name': 'Tester',
    'email': 'e2e-test@example.com',
    'phone': '9999999999',
    'password': 'Password123',
    'terms_accepted': True
})
print('status', res.status_code, 'body', res.json())
body = res.json()
user_id = body.get('user_id')
otp = body.get('otp_for_testing')

print('Verifying OTP...')
res = client.post('/auth/verify-otp', json={'user_id': user_id, 'otp': otp})
print('status', res.status_code, res.json())

print('Logging in...')
res = client.post('/auth/login', json={'email': 'e2e-test@example.com', 'password': 'Password123'})
print('status', res.status_code, res.json())
json_login = res.json()
token = json_login.get('access_token')
headers = {'Authorization': f'Bearer {token}'}

print('Listing transactions (should be empty)')
res = client.get('/api/transactions', headers=headers)
print('status', res.status_code, res.json())

print('Importing CSV...')
csv_text = 'date,merchant,category,type,amount,status\n2024-01-01,Test Store,Shopping,debit,123.45,completed\n'
res = client.post('/api/transactions/import-csv', headers=headers, files={'file': ('tx.csv', csv_text, 'text/csv')})
print('status', res.status_code, res.json())

print('Listing transactions after import')
res = client.get('/api/transactions', headers=headers)
print('status', res.status_code, res.json())

print('Export CSV')
res = client.get('/api/transactions/export-csv', headers=headers)
print('status', res.status_code, 'content-type', res.headers.get('content-type'))
print('CSV preview:\n', res.text[:200])

print('Export PDF')
res = client.get('/api/transactions/export-pdf', headers=headers)
print('status', res.status_code, 'content-type', res.headers.get('content-type'))
print('PDF bytes length:', len(res.content))
