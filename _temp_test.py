import zipfile, os
zip_filename = 'test_exe.exe'
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    if 'exe' == 'exe':
        zipf.writestr('Doctorian-Launcher.bat', '@echo off\r\necho Starting Doctorian Standalone Offline Medical App Engine...\r\nnode server.js\r\npause')

    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.cache', '.upm', 'dist']]
        for file in files:
            if file.endswith('.zip') or file.endswith('.apk') or file.endswith('.exe') or file.endswith('.sqlite') or file.endswith('.db'):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, '.')
            zipf.write(file_path, arcname)
