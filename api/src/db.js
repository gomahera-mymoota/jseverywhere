import mongoose from 'mongoose';

const db = {
    /**
     * MongoDB에 연결합니다.
     * @param {string} DB_HOST - MongoDB 연결 URI
     * @returns {Promise<void>} 연결 성공 또는 실패를 나타내는 Promise
     */
    connect: async (DB_HOST) => {
        // 몽구스 쿼리 엄격 모드 설정 (기본값은 true이며, false로 설정 시 정의되지 않은 필드도 쿼리 가능)
        mongoose.set('strictQuery', true);

        try {
            // mongoose.connect는 Promise를 반환하므로 await를 사용하여 연결 완료를 기다립니다.
            await mongoose.connect(DB_HOST);
            // 연결 성공은 호출하는 쪽(server.js)에서 로그를 출력하므로 여기서는 생략하거나 추가 정보만 로깅
            console.log('🔗 MongoDB connection established.'); 
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            // 연결 실패 시 호출하는 쪽에서 catch 블록을 통해 처리할 수 있도록 에러를 다시 던집니다.
            throw new Error('Failed to connect to MongoDB. Please ensure MongoDB is running and DB_HOST is correct.');
        }

        // 연결 에러 이벤트 리스너 (이미 연결된 상태에서 발생하는 에러 처리)
        mongoose.connection.on('error', (err) => {
            console.error('⚠️ MongoDB runtime error:', err);
            // 이 에러는 주로 연결이 끊겼을 때 발생하므로, 서버를 종료할지 여부는 애플리케이션 정책에 따라 다름
            // 여기서는 심각한 런타임 에러로 간주하여 프로세스 종료를 유지
            console.log('MongoDB connection lost or encountered a runtime error. Exiting process...');
            process.exit(1); // 0 대신 1을 사용하여 비정상 종료를 나타냄
        });

        // 연결 끊김 이벤트 리스너 (재연결 로직 추가 가능)
        mongoose.connection.on('disconnected', () => {
            console.warn('Disconnected from MongoDB.');
        // 여기에 재연결 로직을 구현할 수 있습니다.
        });

        // 연결 해제 이벤트 리스너 (정상적인 종료 시)
        mongoose.connection.on('close', () => {
            console.log('MongoDB connection closed.');
        });
    },

    /**
     * MongoDB 연결을 닫습니다.
     * @returns {Promise<void>} 연결 종료 성공 또는 실패를 나타내는 Promise
     */
    close: async () => {
        try {
            await mongoose.connection.close();
            console.log('🚫 MongoDB connection successfully closed.');
        } catch (error) {
            console.error('❌ Error closing MongoDB connection:', error);
            throw error; // 닫는 중 오류 발생 시 다시 던짐
        }
    },
};

export default db;