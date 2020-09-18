package com.test;
 
 
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.SequenceInputStream;
 
import javax.servlet.http.HttpServletRequest;
import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
 
 
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.jetty.io.Connection;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.websocket.WebSocket;
import org.eclipse.jetty.websocket.WebSocketHandler;
 
 
 
public class TestRecordServlet extends Server {
     
     
    private final static Log LOG =  LogFactory.getLog( TestRecordServlet.class );
      
    public TestRecordServlet(int port) {
        SelectChannelConnector connector = new SelectChannelConnector();
        connector.setPort(port);
        addConnector(connector);
  
        WebSocketHandler wsHandler = new WebSocketHandler() {
            public WebSocket doWebSocketConnect(HttpServletRequest request, String protocol) {
                return new FaceDetectWebSocket();
            }
        };
        setHandler(wsHandler);
    }
  
    /**
     * Simple innerclass that is used to handle websocket connections.
     * 
     * @author jos
     */
    private static class FaceDetectWebSocket implements WebSocket,
            WebSocket.OnBinaryMessage, WebSocket.OnTextMessage {
        private String currentCommand ="";
         
        private Connection connection;
        //private FaceDetection faceDetection = new FaceDetection();
  
        public FaceDetectWebSocket() {
            super();
        }
  
        /**
         * On open we set the connection locally, and enable
         * binary support
         */
        public void onOpen(Connection connection) {
            this.connection = connection;
            this.connection.setMaxBinaryMessageSize(1024 * 512);
        }
  
        /**
         * Cleanup if needed. Not used for this example
         */
        public void onClose(int code, String message) {}
  
        /**
         * When we receive a binary message we assume it is an image. We then run this
         * image through our face detection algorithm and send back the response.
         */
        public void onMessage(byte[] data, int offset, int length) {
  
            if (currentCommand.equals("start")) {
                try {
                    // The temporary file that contains our captured audio stream
                    File f = new File("out.wav");
  
                    // if the file already exists we append it.
                    if (f.exists()) {
                        LOG.info("Adding received block to existing file.");
  
                        // two clips are used to concat the data
                         AudioInputStream clip1 = AudioSystem.getAudioInputStream(f);
                         AudioInputStream clip2 = AudioSystem.getAudioInputStream(new ByteArrayInputStream(data));
  
                         // use a sequenceinput to cat them together
                         AudioInputStream appendedFiles = 
                                    new AudioInputStream(
                                        new SequenceInputStream(clip1, clip2),     
                                        clip1.getFormat(), 
                                        clip1.getFrameLength() + clip2.getFrameLength());
  
                         // write out the output to a temporary file
                            AudioSystem.write(appendedFiles, 
                                    AudioFileFormat.Type.WAVE,
                                    new File("out2.wav"));
  
                            // rename the files and delete the old one
                            File f1 = new File("out.wav");
                            File f2 = new File("out2.wav");
                            f1.delete();
                            f2.renameTo(new File("out.wav"));
                    } else {
                        LOG.info("Starting new recording.");
                        FileOutputStream fOut = new FileOutputStream("out.wav",true);
                        fOut.write(data);
                        fOut.close();
                    }           
                } catch (Exception e) {
                    LOG.error("sss:" + e );
                }
            }
        }
  
        public void onMessage(String data) {
            if (data.startsWith("start")) {
                // before we start we cleanup anything left over
                //cleanup();
                currentCommand = "start";
            } else if (data.startsWith("stop")) {
                currentCommand = "stop";
            } else if (data.startsWith("clear")) {
                // just remove the current recording
                //cleanup();
            } else if (data.startsWith("analyze")) {
                 
            }
        }
    }
  
    /**
     * Start the server on port 999
     */
    public static void main(String[] args) throws Exception {
        TestRecordServlet server = new TestRecordServlet(8080);
        server.start();
        server.join();
    }
}