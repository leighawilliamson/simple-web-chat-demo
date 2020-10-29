// Required libraries
import com.ibm.cloud.objectstorage.ClientConfiguration;
import com.ibm.cloud.objectstorage.SDKGlobalConfiguration;
import com.ibm.cloud.objectstorage.SdkClientException;
import com.ibm.cloud.objectstorage.auth.AWSCredentials;
import com.ibm.cloud.objectstorage.auth.AWSStaticCredentialsProvider;
import com.ibm.cloud.objectstorage.client.builder.AwsClientBuilder;
import com.ibm.cloud.objectstorage.oauth.BasicIBMOAuthCredentials;
import com.ibm.cloud.objectstorage.services.s3.AmazonS3;
import com.ibm.cloud.objectstorage.services.s3.AmazonS3ClientBuilder;
import com.ibm.cloud.objectstorage.services.s3.model.*;
import com.ibm.cloud.objectstorage.services.s3.transfer.TransferManager;
import com.ibm.cloud.objectstorage.services.s3.transfer.TransferManagerBuilder;
import com.ibm.cloud.objectstorage.services.s3.transfer.Upload;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
/*
{
  "apikey": "a5YmGskk9EPU4E_CHtuEyrhNYctfOm2jxR1zGfonUUSF",
  "endpoints": "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
  "iam_apikey_description": "Auto-generated for key 49a1438c-61d6-430a-9f10-a4007016608d",
  "iam_apikey_name": "Service credentials-CosUpload",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/b6ce8ec5c07648c7a65e0c32c480195d::serviceid:ServiceId-c337a9fb-cc1f-4698-bdea-29bddc162d9b",
  "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/b6ce8ec5c07648c7a65e0c32c480195d:63addb5b-1470-4a0f-847e-638baf44b418::"
}
*/
public class JavaCosUpload {
    private static AmazonS3 _cosClient;
    private static String api_key;
    private static String service_instance_id;
    private static String endpoint_url;
    private static String location;

    public static void main(String[] args) throws IOException
    {

        if (args.length == 0) {
            System.out.println("Required filename parameter missing!");
            System.out.println("Usage: java JavaCosUpload <filename>");
            System.exit(-1);
        }
        // Constants for IBM COS values
        SDKGlobalConfiguration.IAM_ENDPOINT = "https://iam.cloud.ibm.com/oidc/token";
        api_key = "a5YmGskk9EPU4E_CHtuEyrhNYctfOm2jxR1zGfonUUSF";
        service_instance_id = "crn:v1:bluemix:public:cloud-object-storage:global:a/b6ce8ec5c07648c7a65e0c32c480195d:63addb5b-1470-4a0f-847e-638baf44b418::";
        endpoint_url = "s3.us.cloud-object-storage.appdomain.cloud";
        location = "us-geo";

        // Create client connection details
        _cosClient = createClient(api_key, service_instance_id, endpoint_url, location);

        // Setting string values
        String bucketName = "stateoflouisianavoterassistantpro-donotdelete-pr-vbbotmryvtuu00";
        //String itemName = "ElectedOfficialsForOffice.csv";
        String itemName = args[0];

        // get the list of buckets
//        listBuckets(_cosClient);

        // create a new text file & upload
        createTextFile(bucketName, itemName);

        // get the list of files from the new bucket
//        listObjects(bucketName, _cosClient);

        // remove new file
//        deleteItem(bucketName, itemName);

        // create & upload the large file using transfer manager & remove large file
//        createLargeFile(bucketName);

        // remove the new bucket
//        deleteBucket(bucketName);
    }

    private static void createLargeFile(String bucketName)  throws IOException {
        String fileName = "Sample"; //Setting the File Name

        try {
            File uploadFile = File.createTempFile(fileName,".tmp");
            uploadFile.deleteOnExit();
            fileName = uploadFile.getName();

            largeObjectUpload(bucketName, uploadFile);
        } catch (InterruptedException e) {
            System.out.println("object upload timed out");
        }

        deleteItem(bucketName, fileName); // remove new large file
    }

    // Create client connection
    public static AmazonS3 createClient(String api_key, String service_instance_id, String endpoint_url, String location)
    {
        AWSCredentials credentials;
        credentials = new BasicIBMOAuthCredentials(api_key, service_instance_id);

        ClientConfiguration clientConfig = new ClientConfiguration().withRequestTimeout(5000);
        clientConfig.setUseTcpKeepAlive(true);

        AWSStaticCredentialsProvider credProvider = new AWSStaticCredentialsProvider(credentials);

        AwsClientBuilder.EndpointConfiguration endptConfig = new AwsClientBuilder.EndpointConfiguration(endpoint_url, location);

        AmazonS3 cosClient = AmazonS3ClientBuilder.standard().withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint_url, location)).withPathStyleAccessEnabled(true)
                .withClientConfiguration(clientConfig).build();

        return cosClient;
    }

    // Create a new bucket
    public static void createBucket(String bucketName, AmazonS3 cosClient)
    {
        cosClient.createBucket(bucketName);
        System.out.printf("Bucket: %s created!\n", bucketName);
    }

    // Retrieve the list of available buckets
    public static void listBuckets(AmazonS3 cosClient)
    {
        System.out.println("Listing buckets:");
        final List<Bucket> bucketList = _cosClient.listBuckets();
        for (final Bucket bucket : bucketList) {
            System.out.println(bucket.getName());
        }
        System.out.println();
    }

    // Retrieve the list of contents for a bucket
    public static void listObjects(String bucketName, AmazonS3 cosClient)
    {
        System.out.println("Listing objects in bucket " + bucketName);
        ObjectListing objectListing = cosClient.listObjects(new ListObjectsRequest().withBucketName(bucketName));
        for (S3ObjectSummary objectSummary : objectListing.getObjectSummaries()) {
            System.out.println(" - " + objectSummary.getKey() + "  " + "(size = " + objectSummary.getSize() + ")");
        }
        System.out.println();
    }


    // Create file and upload to new bucket
    public static void createTextFile(String bucketName, String itemName)
    throws FileNotFoundException
    {
        System.out.printf("Uploading item: %s\n", itemName);

        //InputStream newStream = new ByteArrayInputStream(fileText.getBytes(Charset.forName("UTF-8")));
        File initialFile = new File(itemName);
        InputStream newStream = new FileInputStream(initialFile);

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(initialFile.length());

        PutObjectRequest req = new PutObjectRequest(bucketName, itemName, newStream, metadata);
        _cosClient.putObject(req);

        System.out.printf("Item: %s uploaded!\n", itemName);
    }

    // Delete item
    public static void deleteItem(String bucketName, String itemName) {
        System.out.printf("Deleting item: %s\n", itemName);
        _cosClient.deleteObject(bucketName, itemName);
        System.out.printf("Item: %s deleted!\n", itemName);
    }

    // Delete bucket
    public static void deleteBucket(String bucketName) {
        System.out.printf("Deleting bucket: %s\n", bucketName);
        _cosClient.deleteBucket(bucketName);
        System.out.printf("Bucket: %s deleted!\n", bucketName);
    }

    //  Upload large file to new bucket
    public static void largeObjectUpload(String bucketName, File uploadFile) throws IOException, InterruptedException {

        if (!uploadFile.isFile()) {
            System.out.printf("The file does not exist or is not accessible.\n");
            return;
        }

        System.out.println("Starting large file upload with TransferManager");

        //set the part size to 5 MB
        long partSize = 1024 * 1024 * 20;

        //set the threshold size to 5 MB
        long thresholdSize = 1024 * 1024 * 20;

        AmazonS3 s3client = createClient( api_key, service_instance_id, endpoint_url, location);

        TransferManager transferManager = TransferManagerBuilder.standard()
                .withS3Client(s3client)
                .withMinimumUploadPartSize(partSize)
                .withMultipartCopyThreshold(thresholdSize)
                .build();

        try {
            Upload lrgUpload = transferManager.upload(bucketName, uploadFile.getName(), uploadFile);
            lrgUpload.waitForCompletion();
            System.out.println("Large file upload complete!");
        } catch (SdkClientException e) {
            System.out.printf("Upload error: %s\n", e.getMessage());
        } finally {
            transferManager.shutdownNow();
        }
    }
}
