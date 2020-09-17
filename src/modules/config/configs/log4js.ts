import { Environments } from '../../../enums/environments';
const getAppenders = (appenders: string[]): string[] => {
    if (process.env.NODE_ENV === Environments.DEV) {
        appenders.push('console');
    }

    return appenders;
};

module.exports = {
    appenders: {
        access: {
            type: 'file',
            filename: `${process.env.LOGS_ROOT || ''}appLogs/access.log`,
            layout: { type: 'jsonLayout', separator: ';' },
            maxLogSize: 2621440,
            backups: 10,
            compress: 'true',
        },
        error: {
            type: 'file',
            filename: `${process.env.LOGS_ROOT || ''}appLogs/error.log`,
            layout: { type: 'jsonLayout', separator: ';' },
            maxLogSize: 2621440,
            backups: 10,
            compress: 'true',
        },
        console: { type: 'console' },
    },
    categories: {
        default: { appenders: ['console'], level: 'debug' },
        access: { appenders: getAppenders(['access']), level: 'info' },
        error: { appenders: getAppenders(['error']), level: 'warn' },
    },
};
