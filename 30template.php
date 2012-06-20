<?php
/**
 * PHPExcel
 *
 * Copyright (C) 2006 - 2012 PHPExcel
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * @category   PHPExcel
 * @package    PHPExcel
 * @copyright  Copyright (c) 2006 - 2012 PHPExcel (http://www.codeplex.com/PHPExcel)
 * @license    http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt	LGPL
 * @version    1.7.7, 2012-05-19
 */

/** Error reporting */
error_reporting(E_ALL);

date_default_timezone_set('Europe/London');

/** PHPExcel_IOFactory */
require_once 'libs/phpexcel/Classes/PHPExcel/IOFactory.php';

$objReader = PHPExcel_IOFactory::createReader('Excel5');
$objPHPExcel = $objReader->load("Expenses_Template.xls");

$post = $_POST['expenses'];
$post_name = $_POST['name'];
$post_email = $_POST['email'];
$data = json_decode($post);

$sek = 0;

$baseRow = 13;
foreach($data as $r => $dataRow) {
	$row = $baseRow + $r;
	$objPHPExcel->getActiveSheet()->setCellValue('A'.$row, $dataRow->date);
	$objPHPExcel->getActiveSheet()->setCellValue('B'.$row, $dataRow->location);
	$objPHPExcel->getActiveSheet()->setCellValue('C'.$row, $dataRow->reason);

	switch ($dataRow->type)
	{
	case "Parking and motorway":
	 $objPHPExcel->getActiveSheet()->setCellValue('E'.$row, 'x');
	  break;
	case "Taxi":
	  $objPHPExcel->getActiveSheet()->setCellValue('F'.$row, 'x');
	  break;
	case "Plane and train ticket":
	  $objPHPExcel->getActiveSheet()->setCellValue('G'.$row, 'x');
	  break;
	case "Hotel":
	  $objPHPExcel->getActiveSheet()->setCellValue('H'.$row, 'x');
	  break;
	case "Meals deductable":
	  $objPHPExcel->getActiveSheet()->setCellValue('I'.$row, 'x');
	  break;
	case "Meals non-deductable":
	  $objPHPExcel->getActiveSheet()->setCellValue('J'.$row, 'x');
	  break;
	}
	if (isset($dataRow->vat))
	{
		$objPHPExcel->getActiveSheet()->setCellValue('R'.$row, $dataRow->vat);
	}
	$objPHPExcel->getActiveSheet()->setCellValue('T'.$row, $dataRow->amount);
	$objPHPExcel->getActiveSheet()->setCellValue('U'.$row, $dataRow->currency);


	//calculate
	if (isset($dataRow->currency) && $dataRow->currency == "SEK")
	{
		$sek += (int)$dataRow->amount;
	}
}

$objPHPExcel->getActiveSheet()->setCellValue('B7', $post_name);
$objPHPExcel->getActiveSheet()->setCellValue('W30', $sek);

$today = date("Ymd");

$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
$milliseconds = 1000 * strtotime(date('H:i:s'));
$objWriter->save($milliseconds . '.xls');

$to = $post_email;
$subject = "Your expenses document";
$message = "Hello! You can download your xls-file here: " . "http://www." . $_SERVER['SERVER_NAME'] . "/expenses-manager/" . $milliseconds . ".xls";
$from = "expenses@expenses-manager.com";
$headers = "From:" . $from;
mail($to,$subject,$message,$headers);

echo "Mail Sent.";