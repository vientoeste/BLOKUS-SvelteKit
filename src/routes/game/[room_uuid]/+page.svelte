<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<!-- Board를 data로 받아오는 것이 나을 듯 -->
<head>
  <link rel="stylesheet" href="/main.css" />
</head>
<br />
<br />
<table style="border: 10px;">
  <tr>
    <th />
    <th>0</th>
    <th>1</th>
    <th>2</th>
    <th>3</th>
    <th>4</th>
    <th>5</th>
    <th>6</th>
    <th>7</th>
    <th>8</th>
    <th>9</th>
    <th>0</th>
    <th>1</th>
    <th>2</th>
    <th>3</th>
    <th>4</th>
    <th>5</th>
    <th>6</th>
    <th>7</th>
    <th>8</th>
    <th>9</th>
  </tr>
  <tr>
    <th>0</th>
    <td>{@html data.board[0][0]}</td>
    <td>{@html data.board[0][1]}</td>
    <td>{@html data.board[0][2]}</td>
    <td>{@html data.board[0][3]}</td>
    <td>{@html data.board[0][4]}</td>
    <td>{@html data.board[0][5]}</td>
    <td>{@html data.board[0][6]}</td>
    <td>{@html data.board[0][7]}</td>
    <td>{@html data.board[0][8]}</td>
    <td>{@html data.board[0][9]}</td>
    <td>{@html data.board[0][10]}</td>
    <td>{@html data.board[0][11]}</td>
    <td>{@html data.board[0][12]}</td>
    <td>{@html data.board[0][13]}</td>
    <td>{@html data.board[0][14]}</td>
    <td>{@html data.board[0][15]}</td>
    <td>{@html data.board[0][16]}</td>
    <td>{@html data.board[0][17]}</td>
    <td>{@html data.board[0][18]}</td>
    <td>{@html data.board[0][19]}</td>
  </tr>
  <tr>
    <th>1</th>
    <td>{@html data.board[1][0]}</td>
    <td>{@html data.board[1][1]}</td>
    <td>{@html data.board[1][2]}</td>
    <td>{@html data.board[1][3]}</td>
    <td>{@html data.board[1][4]}</td>
    <td>{@html data.board[1][5]}</td>
    <td>{@html data.board[1][6]}</td>
    <td>{@html data.board[1][7]}</td>
    <td>{@html data.board[1][8]}</td>
    <td>{@html data.board[1][9]}</td>
    <td>{@html data.board[1][10]}</td>
    <td>{@html data.board[1][11]}</td>
    <td>{@html data.board[1][12]}</td>
    <td>{@html data.board[1][13]}</td>
    <td>{@html data.board[1][14]}</td>
    <td>{@html data.board[1][15]}</td>
    <td>{@html data.board[1][16]}</td>
    <td>{@html data.board[1][17]}</td>
    <td>{@html data.board[1][18]}</td>
    <td>{@html data.board[1][19]}</td>
  </tr>
  <tr>
    <th>2</th>
    <td>{@html data.board[2][0]}</td>
    <td>{@html data.board[2][1]}</td>
    <td>{@html data.board[2][2]}</td>
    <td>{@html data.board[2][3]}</td>
    <td>{@html data.board[2][4]}</td>
    <td>{@html data.board[2][5]}</td>
    <td>{@html data.board[2][6]}</td>
    <td>{@html data.board[2][7]}</td>
    <td>{@html data.board[2][8]}</td>
    <td>{@html data.board[2][9]}</td>
    <td>{@html data.board[2][10]}</td>
    <td>{@html data.board[2][11]}</td>
    <td>{@html data.board[2][12]}</td>
    <td>{@html data.board[2][13]}</td>
    <td>{@html data.board[2][14]}</td>
    <td>{@html data.board[2][15]}</td>
    <td>{@html data.board[2][16]}</td>
    <td>{@html data.board[2][17]}</td>
    <td>{@html data.board[2][18]}</td>
    <td>{@html data.board[2][19]}</td>
  </tr>
  <tr>
    <th>3</th>
    <td>{@html data.board[3][0]}</td>
    <td>{@html data.board[3][1]}</td>
    <td>{@html data.board[3][2]}</td>
    <td>{@html data.board[3][3]}</td>
    <td>{@html data.board[3][4]}</td>
    <td>{@html data.board[3][5]}</td>
    <td>{@html data.board[3][6]}</td>
    <td>{@html data.board[3][7]}</td>
    <td>{@html data.board[3][8]}</td>
    <td>{@html data.board[3][9]}</td>
    <td>{@html data.board[3][10]}</td>
    <td>{@html data.board[3][11]}</td>
    <td>{@html data.board[3][12]}</td>
    <td>{@html data.board[3][13]}</td>
    <td>{@html data.board[3][14]}</td>
    <td>{@html data.board[3][15]}</td>
    <td>{@html data.board[3][16]}</td>
    <td>{@html data.board[3][17]}</td>
    <td>{@html data.board[3][18]}</td>
    <td>{@html data.board[3][19]}</td>
  </tr>
  <tr>
    <th>4</th>
    <td>{@html data.board[4][0]}</td>
    <td>{@html data.board[4][1]}</td>
    <td>{@html data.board[4][2]}</td>
    <td>{@html data.board[4][3]}</td>
    <td>{@html data.board[4][4]}</td>
    <td>{@html data.board[4][5]}</td>
    <td>{@html data.board[4][6]}</td>
    <td>{@html data.board[4][7]}</td>
    <td>{@html data.board[4][8]}</td>
    <td>{@html data.board[4][9]}</td>
    <td>{@html data.board[4][10]}</td>
    <td>{@html data.board[4][11]}</td>
    <td>{@html data.board[4][12]}</td>
    <td>{@html data.board[4][13]}</td>
    <td>{@html data.board[4][14]}</td>
    <td>{@html data.board[4][15]}</td>
    <td>{@html data.board[4][16]}</td>
    <td>{@html data.board[4][17]}</td>
    <td>{@html data.board[4][18]}</td>
    <td>{@html data.board[4][19]}</td>
  </tr>
  <tr>
    <th>5</th>
    <td>{@html data.board[5][0]}</td>
    <td>{@html data.board[5][1]}</td>
    <td>{@html data.board[5][2]}</td>
    <td>{@html data.board[5][3]}</td>
    <td>{@html data.board[5][4]}</td>
    <td>{@html data.board[5][5]}</td>
    <td>{@html data.board[5][6]}</td>
    <td>{@html data.board[5][7]}</td>
    <td>{@html data.board[5][8]}</td>
    <td>{@html data.board[5][9]}</td>
    <td>{@html data.board[5][10]}</td>
    <td>{@html data.board[5][11]}</td>
    <td>{@html data.board[5][12]}</td>
    <td>{@html data.board[5][13]}</td>
    <td>{@html data.board[5][14]}</td>
    <td>{@html data.board[5][15]}</td>
    <td>{@html data.board[5][16]}</td>
    <td>{@html data.board[5][17]}</td>
    <td>{@html data.board[5][18]}</td>
    <td>{@html data.board[5][19]}</td>
  </tr>
  <tr>
    <th>6</th>
    <td>{@html data.board[6][0]}</td>
    <td>{@html data.board[6][1]}</td>
    <td>{@html data.board[6][2]}</td>
    <td>{@html data.board[6][3]}</td>
    <td>{@html data.board[6][4]}</td>
    <td>{@html data.board[6][5]}</td>
    <td>{@html data.board[6][6]}</td>
    <td>{@html data.board[6][7]}</td>
    <td>{@html data.board[6][8]}</td>
    <td>{@html data.board[6][9]}</td>
    <td>{@html data.board[6][10]}</td>
    <td>{@html data.board[6][11]}</td>
    <td>{@html data.board[6][12]}</td>
    <td>{@html data.board[6][13]}</td>
    <td>{@html data.board[6][14]}</td>
    <td>{@html data.board[6][15]}</td>
    <td>{@html data.board[6][16]}</td>
    <td>{@html data.board[6][17]}</td>
    <td>{@html data.board[6][18]}</td>
    <td>{@html data.board[6][19]}</td>
  </tr>
  <tr>
    <th>7</th>
    <td>{@html data.board[7][0]}</td>
    <td>{@html data.board[7][1]}</td>
    <td>{@html data.board[7][2]}</td>
    <td>{@html data.board[7][3]}</td>
    <td>{@html data.board[7][4]}</td>
    <td>{@html data.board[7][5]}</td>
    <td>{@html data.board[7][6]}</td>
    <td>{@html data.board[7][7]}</td>
    <td>{@html data.board[7][8]}</td>
    <td>{@html data.board[7][9]}</td>
    <td>{@html data.board[7][10]}</td>
    <td>{@html data.board[7][11]}</td>
    <td>{@html data.board[7][12]}</td>
    <td>{@html data.board[7][13]}</td>
    <td>{@html data.board[7][14]}</td>
    <td>{@html data.board[7][15]}</td>
    <td>{@html data.board[7][16]}</td>
    <td>{@html data.board[7][17]}</td>
    <td>{@html data.board[7][18]}</td>
    <td>{@html data.board[7][19]}</td>
  </tr>
  <tr>
    <th>8</th>
    <td>{@html data.board[8][0]}</td>
    <td>{@html data.board[8][1]}</td>
    <td>{@html data.board[8][2]}</td>
    <td>{@html data.board[8][3]}</td>
    <td>{@html data.board[8][4]}</td>
    <td>{@html data.board[8][5]}</td>
    <td>{@html data.board[8][6]}</td>
    <td>{@html data.board[8][7]}</td>
    <td>{@html data.board[8][8]}</td>
    <td>{@html data.board[8][9]}</td>
    <td>{@html data.board[8][10]}</td>
    <td>{@html data.board[8][11]}</td>
    <td>{@html data.board[8][12]}</td>
    <td>{@html data.board[8][13]}</td>
    <td>{@html data.board[8][14]}</td>
    <td>{@html data.board[8][15]}</td>
    <td>{@html data.board[8][16]}</td>
    <td>{@html data.board[8][17]}</td>
    <td>{@html data.board[8][18]}</td>
    <td>{@html data.board[8][19]}</td>
  </tr>
  <tr>
    <th>9</th>
    <td>{@html data.board[9][0]}</td>
    <td>{@html data.board[9][1]}</td>
    <td>{@html data.board[9][2]}</td>
    <td>{@html data.board[9][3]}</td>
    <td>{@html data.board[9][4]}</td>
    <td>{@html data.board[9][5]}</td>
    <td>{@html data.board[9][6]}</td>
    <td>{@html data.board[9][7]}</td>
    <td>{@html data.board[9][8]}</td>
    <td>{@html data.board[9][9]}</td>
    <td>{@html data.board[9][10]}</td>
    <td>{@html data.board[9][11]}</td>
    <td>{@html data.board[9][12]}</td>
    <td>{@html data.board[9][13]}</td>
    <td>{@html data.board[9][14]}</td>
    <td>{@html data.board[9][15]}</td>
    <td>{@html data.board[9][16]}</td>
    <td>{@html data.board[9][17]}</td>
    <td>{@html data.board[9][18]}</td>
    <td>{@html data.board[9][19]}</td>
  </tr>

  <tr>
    <th>0</th>
    <td>{@html data.board[10][0]}</td>
    <td>{@html data.board[10][1]}</td>
    <td>{@html data.board[10][2]}</td>
    <td>{@html data.board[10][3]}</td>
    <td>{@html data.board[10][4]}</td>
    <td>{@html data.board[10][5]}</td>
    <td>{@html data.board[10][6]}</td>
    <td>{@html data.board[10][7]}</td>
    <td>{@html data.board[10][8]}</td>
    <td>{@html data.board[10][9]}</td>
    <td>{@html data.board[10][10]}</td>
    <td>{@html data.board[10][11]}</td>
    <td>{@html data.board[10][12]}</td>
    <td>{@html data.board[10][13]}</td>
    <td>{@html data.board[10][14]}</td>
    <td>{@html data.board[10][15]}</td>
    <td>{@html data.board[10][16]}</td>
    <td>{@html data.board[10][17]}</td>
    <td>{@html data.board[10][18]}</td>
    <td>{@html data.board[10][19]}</td>
  </tr>
  <tr>
    <th>1</th>
    <td>{@html data.board[11][0]}</td>
    <td>{@html data.board[11][1]}</td>
    <td>{@html data.board[11][2]}</td>
    <td>{@html data.board[11][3]}</td>
    <td>{@html data.board[11][4]}</td>
    <td>{@html data.board[11][5]}</td>
    <td>{@html data.board[11][6]}</td>
    <td>{@html data.board[11][7]}</td>
    <td>{@html data.board[11][8]}</td>
    <td>{@html data.board[11][9]}</td>
    <td>{@html data.board[11][10]}</td>
    <td>{@html data.board[11][11]}</td>
    <td>{@html data.board[11][12]}</td>
    <td>{@html data.board[11][13]}</td>
    <td>{@html data.board[11][14]}</td>
    <td>{@html data.board[11][15]}</td>
    <td>{@html data.board[11][16]}</td>
    <td>{@html data.board[11][17]}</td>
    <td>{@html data.board[11][18]}</td>
    <td>{@html data.board[11][19]}</td>
  </tr>
  <tr>
    <th>2</th>
    <td>{@html data.board[12][0]}</td>
    <td>{@html data.board[12][1]}</td>
    <td>{@html data.board[12][2]}</td>
    <td>{@html data.board[12][3]}</td>
    <td>{@html data.board[12][4]}</td>
    <td>{@html data.board[12][5]}</td>
    <td>{@html data.board[12][6]}</td>
    <td>{@html data.board[12][7]}</td>
    <td>{@html data.board[12][8]}</td>
    <td>{@html data.board[12][9]}</td>
    <td>{@html data.board[12][10]}</td>
    <td>{@html data.board[12][11]}</td>
    <td>{@html data.board[12][12]}</td>
    <td>{@html data.board[12][13]}</td>
    <td>{@html data.board[12][14]}</td>
    <td>{@html data.board[12][15]}</td>
    <td>{@html data.board[12][16]}</td>
    <td>{@html data.board[12][17]}</td>
    <td>{@html data.board[12][18]}</td>
    <td>{@html data.board[12][19]}</td>
  </tr>
  <tr>
    <th>3</th>
    <td>{@html data.board[13][0]}</td>
    <td>{@html data.board[13][1]}</td>
    <td>{@html data.board[13][2]}</td>
    <td>{@html data.board[13][3]}</td>
    <td>{@html data.board[13][4]}</td>
    <td>{@html data.board[13][5]}</td>
    <td>{@html data.board[13][6]}</td>
    <td>{@html data.board[13][7]}</td>
    <td>{@html data.board[13][8]}</td>
    <td>{@html data.board[13][9]}</td>
    <td>{@html data.board[13][10]}</td>
    <td>{@html data.board[13][11]}</td>
    <td>{@html data.board[13][12]}</td>
    <td>{@html data.board[13][13]}</td>
    <td>{@html data.board[13][14]}</td>
    <td>{@html data.board[13][15]}</td>
    <td>{@html data.board[13][16]}</td>
    <td>{@html data.board[13][17]}</td>
    <td>{@html data.board[13][18]}</td>
    <td>{@html data.board[13][19]}</td>
  </tr>
  <tr>
    <th>4</th>
    <td>{@html data.board[14][0]}</td>
    <td>{@html data.board[14][1]}</td>
    <td>{@html data.board[14][2]}</td>
    <td>{@html data.board[14][3]}</td>
    <td>{@html data.board[14][4]}</td>
    <td>{@html data.board[14][5]}</td>
    <td>{@html data.board[14][6]}</td>
    <td>{@html data.board[14][7]}</td>
    <td>{@html data.board[14][8]}</td>
    <td>{@html data.board[14][9]}</td>
    <td>{@html data.board[14][10]}</td>
    <td>{@html data.board[14][11]}</td>
    <td>{@html data.board[14][12]}</td>
    <td>{@html data.board[14][13]}</td>
    <td>{@html data.board[14][14]}</td>
    <td>{@html data.board[14][15]}</td>
    <td>{@html data.board[14][16]}</td>
    <td>{@html data.board[14][17]}</td>
    <td>{@html data.board[14][18]}</td>
    <td>{@html data.board[14][19]}</td>
  </tr>
  <tr>
    <th>5</th>
    <td>{@html data.board[15][0]}</td>
    <td>{@html data.board[15][1]}</td>
    <td>{@html data.board[15][2]}</td>
    <td>{@html data.board[15][3]}</td>
    <td>{@html data.board[15][4]}</td>
    <td>{@html data.board[15][5]}</td>
    <td>{@html data.board[15][6]}</td>
    <td>{@html data.board[15][7]}</td>
    <td>{@html data.board[15][8]}</td>
    <td>{@html data.board[15][9]}</td>
    <td>{@html data.board[15][10]}</td>
    <td>{@html data.board[15][11]}</td>
    <td>{@html data.board[15][12]}</td>
    <td>{@html data.board[15][13]}</td>
    <td>{@html data.board[15][14]}</td>
    <td>{@html data.board[15][15]}</td>
    <td>{@html data.board[15][16]}</td>
    <td>{@html data.board[15][17]}</td>
    <td>{@html data.board[15][18]}</td>
    <td>{@html data.board[15][19]}</td>
  </tr>
  <tr>
    <th>6</th>
    <td>{@html data.board[16][0]}</td>
    <td>{@html data.board[16][1]}</td>
    <td>{@html data.board[16][2]}</td>
    <td>{@html data.board[16][3]}</td>
    <td>{@html data.board[16][4]}</td>
    <td>{@html data.board[16][5]}</td>
    <td>{@html data.board[16][6]}</td>
    <td>{@html data.board[16][7]}</td>
    <td>{@html data.board[16][8]}</td>
    <td>{@html data.board[16][9]}</td>
    <td>{@html data.board[16][10]}</td>
    <td>{@html data.board[16][11]}</td>
    <td>{@html data.board[16][12]}</td>
    <td>{@html data.board[16][13]}</td>
    <td>{@html data.board[16][14]}</td>
    <td>{@html data.board[16][15]}</td>
    <td>{@html data.board[16][16]}</td>
    <td>{@html data.board[16][17]}</td>
    <td>{@html data.board[16][18]}</td>
    <td>{@html data.board[16][19]}</td>
  </tr>
  <tr>
    <th>7</th>
    <td>{@html data.board[17][0]}</td>
    <td>{@html data.board[17][1]}</td>
    <td>{@html data.board[17][2]}</td>
    <td>{@html data.board[17][3]}</td>
    <td>{@html data.board[17][4]}</td>
    <td>{@html data.board[17][5]}</td>
    <td>{@html data.board[17][6]}</td>
    <td>{@html data.board[17][7]}</td>
    <td>{@html data.board[17][8]}</td>
    <td>{@html data.board[17][9]}</td>
    <td>{@html data.board[17][10]}</td>
    <td>{@html data.board[17][11]}</td>
    <td>{@html data.board[17][12]}</td>
    <td>{@html data.board[17][13]}</td>
    <td>{@html data.board[17][14]}</td>
    <td>{@html data.board[17][15]}</td>
    <td>{@html data.board[17][16]}</td>
    <td>{@html data.board[17][17]}</td>
    <td>{@html data.board[17][18]}</td>
    <td>{@html data.board[17][19]}</td>
  </tr>
  <tr>
    <th>8</th>
    <td>{@html data.board[18][0]}</td>
    <td>{@html data.board[18][1]}</td>
    <td>{@html data.board[18][2]}</td>
    <td>{@html data.board[18][3]}</td>
    <td>{@html data.board[18][4]}</td>
    <td>{@html data.board[18][5]}</td>
    <td>{@html data.board[18][6]}</td>
    <td>{@html data.board[18][7]}</td>
    <td>{@html data.board[18][8]}</td>
    <td>{@html data.board[18][9]}</td>
    <td>{@html data.board[18][10]}</td>
    <td>{@html data.board[18][11]}</td>
    <td>{@html data.board[18][12]}</td>
    <td>{@html data.board[18][13]}</td>
    <td>{@html data.board[18][14]}</td>
    <td>{@html data.board[18][15]}</td>
    <td>{@html data.board[18][16]}</td>
    <td>{@html data.board[18][17]}</td>
    <td>{@html data.board[18][18]}</td>
    <td>{@html data.board[18][19]}</td>
  </tr>
  <tr>
    <th>9</th>
    <td>{@html data.board[19][0]}</td>
    <td>{@html data.board[19][1]}</td>
    <td>{@html data.board[19][2]}</td>
    <td>{@html data.board[19][3]}</td>
    <td>{@html data.board[19][4]}</td>
    <td>{@html data.board[19][5]}</td>
    <td>{@html data.board[19][6]}</td>
    <td>{@html data.board[19][7]}</td>
    <td>{@html data.board[19][8]}</td>
    <td>{@html data.board[19][9]}</td>
    <td>{@html data.board[19][10]}</td>
    <td>{@html data.board[19][11]}</td>
    <td>{@html data.board[19][12]}</td>
    <td>{@html data.board[19][13]}</td>
    <td>{@html data.board[19][14]}</td>
    <td>{@html data.board[19][15]}</td>
    <td>{@html data.board[19][16]}</td>
    <td>{@html data.board[19][17]}</td>
    <td>{@html data.board[19][18]}</td>
    <td>{@html data.board[19][19]}</td>
  </tr>
</table>
