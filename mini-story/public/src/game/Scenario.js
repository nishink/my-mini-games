export const SCENARIO = {
    start: {
        name: "???",
        bg: "#2c3e50",
        char: "transparent",
        text: "目が覚めると、見知らぬ部屋にいた。\n静まり返った空気の中に、二つの扉だけが並んでいる。",
        next: "choose_door"
    },
    choose_door: {
        name: "システム",
        bg: "#2c3e50",
        char: "transparent",
        text: "どちらの扉に進みますか？",
        choices: [
            { text: "右の扉（明るい気配）", next: "right_path" },
            { text: "左の扉（静かな気配）", next: "left_path" }
        ]
    },
    right_path: {
        name: "???",
        bg: "#f39c12",
        char: "#e67e22",
        text: "右の扉を開けると、そこは眩い光に包まれた庭園だった。\n「こんにちは、旅の人」",
        next: "garden_greet"
    },
    garden_greet: {
        name: "庭師",
        bg: "#f39c12",
        char: "#e67e22",
        text: "麦わら帽子を被った人物が、こちらを見て微笑んでいる。\n「ここは希望の庭。君が来るのを待っていたよ」",
        next: "happy_end"
    },
    left_path: {
        name: "???",
        bg: "#222",
        char: "#95a5a6",
        text: "左の扉を開けると、そこは果てしなく続く図書室だった。\n「ふむ、新しい客か」",
        next: "library_greet"
    },
    library_greet: {
        name: "司書",
        bg: "#222",
        char: "#95a5a6",
        text: "眼鏡をかけた人物が、本から目を離さずに言った。\n「ここは知識の迷宮。出口を探すなら、まずは一冊読んでいくがいい」",
        next: "normal_end"
    },
    happy_end: {
        name: "物語の終わり",
        bg: "#f1c40f",
        char: "transparent",
        text: "あなたは庭師と共に、穏やかな午後を過ごすことにした。\n―― HAPPY END",
        next: null
    },
    normal_end: {
        name: "物語の終わり",
        bg: "#7f8c8d",
        char: "transparent",
        text: "あなたは司書に勧められた本を読み耽り、時を忘れた。\n―― NORMAL END",
        next: null
    }
};
