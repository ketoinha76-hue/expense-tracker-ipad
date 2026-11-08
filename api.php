<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/data_sync.json';

// Khởi tạo file dữ liệu mặc định nếu chưa có
if (!file_exists($dataFile)) {
    $initialData = [
        'version' => 1,
        'updated_at' => round(microtime(true) * 1000),
        'transactions' => [],
        'wallets' => [],
        'categories' => [],
        'goals' => []
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $content = file_get_contents($dataFile);
    echo $content ? $content : json_encode(['error' => 'No data']);
    exit();
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        exit();
    }

    $existing = json_decode(file_get_contents($dataFile), true) ?: [];

    // Cập nhật các trường
    if (isset($payload['transactions'])) {
        $existing['transactions'] = $payload['transactions'];
    }
    if (isset($payload['wallets'])) {
        $existing['wallets'] = $payload['wallets'];
    }
    if (isset($payload['categories'])) {
        $existing['categories'] = $payload['categories'];
    }
    if (isset($payload['goals'])) {
        $existing['goals'] = $payload['goals'];
    }

    $existing['updated_at'] = round(microtime(true) * 1000);

    file_put_contents($dataFile, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'status' => 'success',
        'updated_at' => $existing['updated_at'],
        'data' => $existing
    ]);
    exit();
}
