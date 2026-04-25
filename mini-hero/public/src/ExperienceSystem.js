export class ExperienceSystem {
    /**
     * 指定レベルに到達するために必要な *累計* 経験値を計算する
     * 式: 50 * (level^1.5)
     */
    static getRequiredTotalExp(level) {
        if (level <= 1) return 0;
        return Math.floor(100 * Math.pow(level - 1, 1.8));
    }

    /**
     * 指定レベルから次のレベルに上がるために必要な経験値を計算する
     */
    static getExpForNextLevel(currentLevel) {
        return this.getRequiredTotalExp(currentLevel + 1) - this.getRequiredTotalExp(currentLevel);
    }
}
