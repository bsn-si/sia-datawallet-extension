export const storageName = 'local';

export default (wallet, path) => {
    let currentDir = '';
    if (path) {
        currentDir = path.replace(storageName + '://', '');
        if (currentDir && !currentDir.endsWith('/')) {
            currentDir += '/';
        }
    }
    return wallet + '/' + currentDir;
};
