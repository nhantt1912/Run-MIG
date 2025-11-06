

export enum GAME_STATE {
    PLAYING = 0,
    PAUSE,
    GAME_OVER,
    WIN,
}
export enum PLAYER_STATE {
    NONE,
    IDLE,
    RUN,
    JUMP_UP,
    JUMP_DOWN,
    EXTRA_JUMP
}

export enum PLAYER_STATE_NAME {
    IDLE = "Idle",
    RUN = "Running",
    JUMP_UP = "JumpUp",
    EXTRA_JUMP = "ExtraJump",
    JUMP_DOWN = "JumpDown"
}

export enum EVENT_TYPE{
    GAME_STATE_CHANGED = "game_state_changed",
    GAME_PLAYING = "game_playing",
    GAME_PAUSED = "game_paused",
    GAME_OVER = "game_over",
    GAME_WIN = "game_win",
    SWIPE_UP = "swipe_up",
}

export const DeltaTime_Monitor = 1/144;