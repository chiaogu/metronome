import { useState, useEffect, useRef } from 'preact/hooks';

const TOKEN = '';
const PLAYER_NAME = 'Metronome';

function getTrackInfo(state) {
  const { track_window: { current_track: currentTrack = {} } = {} } = (state || {});
  return currentTrack;
}

function changeMeta(icon, name = 'Mute Spotify Ads') {
  document.title = name;
}

function insertSdkToBody() {
  const script = document.createElement('script');
  script.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js');
  document.body.appendChild(script);
}

async function initSpotifyPlayer({ onStateChange, onError, onReady }) {
  insertSdkToBody();
  await new Promise(resolve => window.onSpotifyWebPlaybackSDKReady = resolve);

  const player = new window.Spotify.Player({ name: PLAYER_NAME, getOAuthToken });
  player.addListener('initialization_error', onPlayerError);
  player.addListener('authentication_error', onPlayerError);
  player.addListener('account_error', onPlayerError);
  player.addListener('playback_error', onPlayerError);
  player.addListener('ready', onPlayerReady);
  player.addListener('not_ready', onPlayerNotReady);
  player.addListener('player_state_changed', onPlayerStateChange);
  player.connect();

  let previousTrackId;
  let previousTrackType;
  let volume = await player.getVolume();

  async function getOAuthToken(callback) {
    // const queryString = new URLSearchParams(window.location.search);
    // const refreshToken = queryString.get('refresh_token');
    // const isLocalHost = window.location.host.includes('localhost');
    // if(!refreshToken && !isLocalHost) return window.location.href = '/api/login';
    // const refreshTokenUrl = `/api/refresh-token?refresh_token=${refreshToken}`;
    // try {
    //   const { access_token } = await (await fetch(refreshTokenUrl)).json();
    //   callback(access_token);
    // } catch(error) {
    //   onError(error.message);
    // }
    callback(TOKEN);
  }

  async function onTrackChange({ name, type }) {
    // if(type === 'ad') {
    //   if(previousTrackType !== type) volume = await player.getVolume();
    //   await player.setVolume(0);
    //   changeMeta('favicon-mute.ico', name);
    // } else {
    //   await player.setVolume(volume);
    //   changeMeta('favicon.ico', name);
    // }
    previousTrackType = type;
  }

  function onPlayerStateChange(state) {
    onStateChange(state);
    const currentTrack = getTrackInfo(state);
    if(previousTrackId !== currentTrack.id) onTrackChange(currentTrack);
    previousTrackId = currentTrack.id;
  }

  function onPlayerError({ message }) {
    onError(message);
  }

  function onPlayerReady({ device_id }) {
    onReady(device_id);
  }

  function onPlayerNotReady({ device_id }) {
    onError({ message: `Device ${device_id} has gone offline` })
  }

  return player;
}

function listenToMediaAction({ onPreviousTrack, onNextTrack, onPlay, onPause }) {
  // console.log('listenToMediaAction', navigator.mediaSession);
  // if(!navigator.mediaSession) return;
  // navigator.mediaSession.setActionHandler('previoustrack', onPreviousTrack);
  // navigator.mediaSession.setActionHandler('nexttrack', onNextTrack);
  // navigator.mediaSession.setActionHandler('play', onPlay);
  // navigator.mediaSession.setActionHandler('pause', onPause);
}

export default function useSpotifyPlayer() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const player = useRef();

  useEffect(() => {
    player.current = initSpotifyPlayer({
      onStateChange(state) {
        console.log(state);
        setErrorMessage(undefined);
        setPlayerState(state);
      },
      onError(message) {
        console.log(message);
        setErrorMessage(message);
        setIsPlayerReady(false);
      },
      onReady() {
        setIsPlayerReady(true);
      }
    });
    listenToMediaAction({
      onPreviousTrack() {
        console.log('listenToMediaAction', 'onPreviousTrack');
      },
      onNextTrack() {
        console.log('listenToMediaAction', 'onNextTrack');
      },
      onPlay() {
        console.log('listenToMediaAction', 'onPlay');
      },
      onPause() {
        console.log('listenToMediaAction', 'onPause');
      }
    });
  }, []);

  return { isPlayerReady, errorMessage, playerState, player: player.current };
}