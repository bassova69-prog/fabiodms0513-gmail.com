
/**
 * Service pour interagir avec Google Calendar API
 */

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events.readonly';

let gapiInited = false;
let gsisInited = false;
let tokenClient: any;

/**
 * Initialise l'API Google Client
 */
export const initGoogleApi = (): Promise<void> => {
  return new Promise((resolve) => {
    // @ts-ignore
    window.gapi.load('client', async () => {
      // @ts-ignore
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited = true;
      resolve();
    });

    // @ts-ignore
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // À remplacer par Fabio
      scope: SCOPES,
      callback: '', // défini lors de l'appel
    });
    gsisInited = true;
  });
};

/**
 * Récupère les événements du calendrier principal
 */
export const listUpcomingEvents = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
        }
        // @ts-ignore
        const response = await window.gapi.client.calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 50,
          orderBy: 'startTime',
        });
        resolve(response.result.items || []);
      };

      // @ts-ignore
      if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (err) {
      reject(err);
    }
  });
};
