import chalk from 'chalk';

export default (type, message, ...extras) => {
    const timestamp = new Date().toISOString();
    const header = `[${timestamp}] [${type.toUpperCase()}]`;

    // Định màu cho header theo loại log
    let coloredHeader;
    switch(type.toLowerCase()) {
        case 'info':
            coloredHeader = chalk.blue(header);
            break;
        case 'warn':
            coloredHeader = chalk.yellow(header);
            break;
        case 'error':
            coloredHeader = chalk.red(header);
            break;
        case 'debug':
            coloredHeader = chalk.green(header);
            break;
        default:
            coloredHeader = header;
    }

    // Chuyển các extras sang string
    const extraStr = extras.map(e => {
        try {
            return typeof e === 'object' ? JSON.stringify(e) : String(e);
        } catch {
            return String(e);
        }
    }).join(' ');

    // Kết hợp header + message + extras
    const logMessage = `${coloredHeader} ${message}` + (extraStr ? ' ' + extraStr : '');
    console.log(logMessage);
}
