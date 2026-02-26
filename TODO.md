# Accounts Module Updates - TODO

## Task 1: Transfer Money - Add Dropdown for destination account
- [ ] Replace "To Bank Name" input with a Select dropdown
- [ ] Replace "To Account Number" input with the same dropdown (showing bank name - account number)
- [ ] Filter out the source account from the destination dropdown
- [ ] Update transferData state to include toAccountId

## Task 2: Hide Deleted/Closed Accounts
- [ ] Filter AccountCards to only show Active accounts
- [ ] Filter accounts table to only show Active accounts
- [ ] Filter Export dropdown to only show Active accounts

## Task 3: View Details Functionality
- [ ] Add state for view details dialog (isViewDetailsOpen, selectedAccount)
- [ ] Create View Details dialog with account information
- [ ] Make "View Details" dropdown menu item functional
