import sys, traceback
sys.path.insert(0, r'C:\Desktop\digibank\Digital Banking Dashboard UI\src\backend')
try:
    import main
    print('imported main successfully')
except Exception:
    traceback.print_exc()