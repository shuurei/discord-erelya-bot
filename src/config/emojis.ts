import { env } from '@/utils'

interface ApplicationEmojiId {
    dev: string;
    prod: string;
}

export type ApplicationEmojiName = keyof typeof applicationEmojiIds;

export const applicationEmojiIds = {
    voiceChannel: {
        dev: '1366513582199541800',
        prod: '1342655444484886650'
    },
    stageChannel: {
        dev: '1366513562784366723',
        prod: '1342655729055826041'
    },
    textChannel: {
        dev: '1366513550956167189',
        prod: '1342655488348655626'
    },
    categoryChannel: {
        dev: '1366513539497463848',
        prod: '1342655898392334377'
    },
    // Arrow
    redArrow: {
        dev: '1366512771260481626',
        prod: '1342980251784970361'
    },
    greenArrow: {
        dev: '1366512787991433236',
        prod: '1343069739978850447'
    },
    yellowArrow: {
        dev: '1366512779556818954',
        prod: '1342980278804545670'
    },
    purpleArrow: {
        dev: '1366512763303628810',
        prod: '1342980220394672221'
    },
    blueArrow: {
        dev: '1373467069768536165',
        prod: '1385819721605316730'
    },
    cyanArrow: {
        dev: '1373467006795387003',
        prod: '1385819670896050317'
    },
    whiteArrow: {
        dev: '1373466902801809478',
        prod: '1385819618735816824'
    },
    pinkArrow: {
        dev: '1373466950726062141',
        prod: '1385819789209112618'
    },
    // Sub Entry
    graySubEntry: {
        dev: '1412969509047894137',
        prod: '1423306275915300864'
    },
    yellowSubEntry: {
        dev: '1412969535136468992',
        prod: '1423306341190996030'
    },
    lightGraySubEntry: {
        dev: '1412972355080290334',
        prod: '1423306399026516018'
    },
    redSubEntry: {
        dev: '1412972290240544868',
        prod: '1423306471822725152'
    },
    greenSubEntry: {
        dev: '1412972394016018432',
        prod: '1423306524117434408'
    },
    // Bullet
    blueBullet: {
        dev: '1418433617238950038',
        prod: '1423305990958223482'
    },
    greenBullet: {
        dev: '1412969556682739926',
        prod: '1423306041751371916'
    },
    yellowBullet: {
        dev: '1412969569076904046',
        prod: '1423306085636374530'
    },
    lightGrayBullet: {
        dev: '1412972142584135771',
        prod: '1423306128816738365'
    },
    redBullet: {
        dev: '1412972111928103024',
        prod: '1423306178280296458'
    },
    // Rect
    whiteRect: {
        dev: '1423334828551573588',
        prod: '1423361609933525103'
    },
    yellowRect: {
        dev: '1423335622499766432',
        prod: '1423361596138192977'
    },
    redRect: {
        dev: '1423335629172904220',
        prod: '1423361587154260238'
    },
    greenRect: {
        dev: '1423334822482546801',
        prod: '1423361602073264341'
    },
    indogoRect: {
        dev: '1423335752284115155',
        prod: '1423361570502738071'
    },
    // Status
    online: {
        dev: '1366512708853174343',
        prod: '1342979602468962487'
    },
    idle: {
        dev: '1366512718399537232',
        prod: '1342979785835544576'
    },
    dnd: {
        dev: '1366512728239509504',
        prod: '1342979809713848412'
    },
    // Other
    empty: {
        dev: '1412970747907014656',
        prod: '1423305833587933307'
    },
    // News
    identity: {
        dev: '1503653023115903116',
        prod: ''
    }, 
    crown: {
        dev: '1503656145544544296',
        prod: ''
    },
    leaf: {
        dev: '1503655887091535962',
        prod: ''
    },
    diamond: {
        dev: '1503655909799362640',
        prod: ''
    },
    thread: {
        dev: '1503655931102101635',
        prod: ''
    },
    userCheck: {
        dev: '1503657737480044554',
        prod: ''
    },
    moderate: {
        dev: '1503662391575969822',
        prod: ''
    },
    crossMark: {
        dev: '1503663336750055495',
        prod: ''
    },
    checkMark: {
        dev: '1503663330584301629',
        prod: ''
    },
    infoIcon: {
        dev: '1503668975135887370',
        prod: ''
    },
    clockIcon: {
        dev: '1503691120754950285',
        prod: ''
    },
    tagIcon: {
        dev: '1503867166535975149',
        prod: ''
    },
    coinsIcon: {
        dev: '1504225260373807155',
        prod: ''
    },
    shieldIcon: {
        dev: '1504279470280802464',
        prod: ''
    },
    ankhIcon: {
        dev: '1504272656273375313',
        prod: ''
    },
    rankFIcon: {
        dev: '1504274836120276992',
        prod: ''
    },
    rankEIcon: {
        dev: '1504274811419889775',
        prod: ''
    },
    rankDIcon: {
        dev: '1504274784647909396',
        prod: ''
    },
    rankCIcon: {
        dev: '1504274730205577357',
        prod: ''
    },
    rankBIcon: {
        dev: '1504274689441140777',
        prod: ''
    },
    rankAIcon: {
        dev: '1504274609501900801',
        prod: ''
    },
} satisfies Record<string, ApplicationEmojiId>;

const getApplicationEmojiIds  = (type: keyof ApplicationEmojiId) => {
    return Object.fromEntries(
        Object.entries(applicationEmojiIds).map(
            ([key, value]) => [key, value[type]]
        )
    );
}

export const devApplicationEmojiIds = getApplicationEmojiIds ('dev');
export const prodApplicationEmojiIds = getApplicationEmojiIds ('prod');

export const currentApplicationEmojiIds = env.isDev ? devApplicationEmojiIds : prodApplicationEmojiIds;