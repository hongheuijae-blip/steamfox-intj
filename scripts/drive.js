import { google } from "googleapis";

/**
 * Google Drive 클라이언트 생성
 */
export function getDriveClient() {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    );

    auth.setCredentials({
        refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    });

    return google.drive({ version: "v3", auth });
}

/**
 * Google Drive에 파일 업로드
 * @param {Buffer} buffer - 업로드할 파일 버퍼
 * @param {string} filename - 파일 이름
 * @param {string} mimeType - MIME 타입
 */
export async function uploadToDrive(buffer, filename, mimeType) {
    const drive = getDriveClient();

    const folderId = process.env.DRIVE_IMAGE_FOLDER_ID;
    if (!folderId) {
        throw new Error("❌ DRIVE_IMAGE_FOLDER_ID 환경변수가 없습니다.");
    }

    try {
        const res = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [folderId]
            },
            media: {
                mimeType,
                body: buffer
            }
        });

        console.log(`📤 Drive 업로드 완료: ${filename} → ID: ${res.data.id}`);
        return res.data.id;
    } catch (error) {
        console.error("❌ Drive 업로드 실패:", error);
        throw error;
    }
}
